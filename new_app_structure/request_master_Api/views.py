from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from new_app_structure.models import RequestMaster
from new_app_structure.request_master_Api.serializers import get_RequestMasterSerializer, post_request_master_serializer

@api_view(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
def request_master(request,id=None, request_id=None):
    if request.method == 'GET':
        if id==None and request_id==None:
            
            obj = RequestMaster.objects.all()
            serializer = get_RequestMasterSerializer(obj, many=True)
            return Response(serializer.data)
        
        if request_id and id:
            obj = RequestMaster.objects.filter(request_id=request_id,id=id)
            if obj.exists():
                serializer = get_RequestMasterSerializer(obj,many=True)
                return Response(serializer.data)
            else:
                return Response({"error": "Request Master not found."}, status=status.HTTP_404_NOT_FOUND)
            
        else:
            if request_id :
                print(request_id)
                obj = RequestMaster.objects.filter(request_id=request_id)
                if obj.exists():
                    serializer = get_RequestMasterSerializer(obj,many=True)
                    return Response(serializer.data)
                else:
                    return Response({"error": "Request Master not found."}, status=status.HTTP_404_NOT_FOUND)
                
        


    elif request.method == 'POST':
        data = request.data
        serializer = post_request_master_serializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        if request_id is not None:
            try:
                obj = RequestMaster.objects.get(request_id=request_id)
                obj.delete()
                return Response({"message": "Request Master deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
            except RequestMaster.DoesNotExist:
                return Response({"error": "Request Master not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response({"error": "request_id is required."}, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'PUT':
        try:
            obj = RequestMaster.objects.get(request_id=request_id,id=id)
        except RequestMaster.DoesNotExist:
            return Response({"error": "Request Master not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = get_RequestMasterSerializer(obj, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'PATCH':
        try:
            obj = RequestMaster.objects.get(request_id=request_id,id=id)
        except RequestMaster.DoesNotExist:
            return Response({"error": "Request Master not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = post_request_master_serializer(obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)





@api_view(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
def request_master_id(request, id=None, request_id=None):
    if request.method == 'GET':
            obj = RequestMaster.objects.all()
            serializer = get_RequestMasterSerializer(obj, many=True)
            return Response(serializer.data)

    elif request.method == 'POST':
        data = request.data
        serializer = post_request_master_serializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        if request_id is not None:
            try:
                obj = RequestMaster.objects.get(request_id=request_id)
                obj.delete()
                return Response({"message": "Request Master deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
            except RequestMaster.DoesNotExist:
                return Response({"error": "Request Master not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response({"error": "request_id is required."}, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'PUT':
        try:
            obj = RequestMaster.objects.get(request_id=request_id,id=id)
        except RequestMaster.DoesNotExist:
            return Response({"error": "Request Master not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = get_RequestMasterSerializer(obj, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'PATCH':
        try:
            obj = RequestMaster.objects.get(request_id=request_id,id=id)
        except RequestMaster.DoesNotExist:
            return Response({"error": "Request Master not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = get_RequestMasterSerializer(obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
