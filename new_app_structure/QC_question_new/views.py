from django.shortcuts import render

from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from new_app_structure.QC_question_new.serializers import qc_serializer
from new_app_structure.models import qc_question


@api_view(['GET','POST','PUT','PATCH','DELETE'])


def qc_tables(request, request_id=None):
    
    if request.method =='GET':
        obj= qc_question.objects.select_related()
        serializers=qc_serializer(obj,many=True)
        return Response(serializers.data)
    
    if request.method =='POST':
        data=request.data
        serializers=qc_serializer(data=data)
        if serializers.is_valid():
            serializers.save()
            return Response(serializers.data)
        return Response(serializers.errors)
    
    if request.method =='DELETE':
        obj = qc_question.objects.all()
        print(obj)
        return Response("request list deleted")
    
    
    if request.method == 'PUT':
        try:
        
            obj = qc_question.objects.get(request_id=request_id)
        except qc_question.DoesNotExist:
            return Response({"error": "request_list not found."}, status=status.HTTP_404_NOT_FOUND)
        
        
        serializer = qc_serializer(obj, data=request.data)
    
        if serializer.is_valid():
            serializer.save()  
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        
    if request.method == 'PATCH':
        try:
            
            obj = qc_question.objects.get(request_id=request_id)
        except qc_question.DoesNotExist:
            return Response({"error": "request_list not found."}, status=status.HTTP_404_NOT_FOUND)
        
        
        serializer = qc_serializer(obj, data=request.data)
        
        
        if serializer.is_valid():
            serializer.save()  
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
