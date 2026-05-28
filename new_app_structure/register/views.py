from django.shortcuts import render
from django.core.mail import EmailMessage
from django.conf import settings

from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status

from new_app_structure.models import register
from new_app_structure.register.serializer import register_serializer

@api_view(['GET','POST','PUT','PATCH','DELETE'])

def register_view(request,id=None):
    
    if request.method =='GET':
        if id:
            try:
                obj = register.objects.get(id=id)
                serializers=register_serializer(obj)
                return Response(serializers.data)
            except register.DoesNotExist:
                return Response({"error": "request_list not found."}, status=status.HTTP_404_NOT_FOUND)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                    
        else:
            obj= register.objects.all()
            serializers=register_serializer(obj,many=True)
            return Response(serializers.data)


    if request.method =='POST':
        data=request.data
        serializers=register_serializer(data=data)
        if serializers.is_valid():
            serializers.save()
            return Response(serializers.data)
        return Response(serializers.errors)
    
    if request.method =='DELETE':
        obj = register.objects.all()
        print(obj)
        return Response("request list deleted")
    
    
    if request.method == 'PUT':
        try:
            obj = register.objects.get(id=id)
        except register.DoesNotExist:
            return Response({"error": "ID not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = register_serializer(obj, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    if request.method == 'PATCH':
        try:
            obj = register.objects.get(id=id)
        except register.DoesNotExist:
            return Response({"error": "ID not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = register_serializer(obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
from django.utils.crypto import get_random_string
from django.utils.timezone import now, timedelta

from django.core.mail import send_mail
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

@api_view(["POST"])
def send_reset_link(request):
    email = request.data.get("email")
    print("Email", email)
    print("recipient Email", [email])
    try:
        user = register.objects.get(email=email)
        token = get_random_string(length=32)
        user.reset_token = token
        user.token_expiry = now() + timedelta(minutes=15)
        user.save()

        reset_link = f"http://148.135.138.195/app1/reset-password/{user.id}/{token}"
        subject="Reset Your Password"
        message=f"Click the link to reset your password:\n\n{reset_link}\n\nNote: Link expires in 15 minutes."
        # send_mail(
        #     subject="Reset Your Password",
        #     message=f"Click the link to reset your password:\n\n{reset_link}\n\nNote: Link expires in 15 minutes.",
        #     from_email="sme@aero360.co.in",
        #     recipient_list=[email],
        #     fail_silently=False,
        # )
        emailSend = EmailMessage(
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    [email],  # self.email when in production
                    # cc=[settings.ADMIN_EMAIL],  # CC admin
                )
                # try:
        print("Type of message",type(message))
        emailSend.send()
        
        return Response({"message": "Reset link sent successfully."}, status=status.HTTP_200_OK)
    except register.DoesNotExist:
        return Response({"error": "Email not found."}, status=status.HTTP_404_NOT_FOUND)

@api_view(["POST"])
def reset_password(request):
    user_id = request.data.get("id")
    token = request.data.get("token")
    new_password = request.data.get("password")

    try:
        user = register.objects.get(id=user_id, reset_token=token)
        if user.token_expiry and now() > user.token_expiry:
            return Response({"error": "Token has expired."}, status=status.HTTP_400_BAD_REQUEST)

        user.password = new_password  #  NOTE: Better to hash this!
        user.reset_token = None
        user.token_expiry = None
        user.save()

        return Response({"message": "Password reset successful."}, status=status.HTTP_200_OK)
    except register.DoesNotExist:
        return Response({"error": "Invalid token or user."}, status=status.HTTP_404_NOT_FOUND)