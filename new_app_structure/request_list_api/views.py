from django.shortcuts import render

from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status

from new_app_structure.models import BOMList,ComponentMaster,VendorList,Inventory,BOMList,VendorMaster,BOMMaster,RequestList,RequestMaster, po_master
from new_app_structure.request_list_api.serializers import request_serializer
from new_app_structure.permissions import IsAdmin, IsUser
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes


@api_view(['GET','POST','PUT','PATCH','DELETE'])


def request_list(request, request_id=None):
    
    if request.method =='GET':
        obj= RequestList.objects.select_related()
        serializers=request_serializer(obj,many=True)
        return Response(serializers.data)
    
    if request.method =='POST':
        data=request.data
        serializers=request_serializer(data=data)
        if serializers.is_valid():
            serializers.save()
            return Response(serializers.data)
        return Response(serializers.errors)
    
    if request.method =='DELETE':
        obj = RequestList.objects.all()
        print(obj)
        return Response("request list deleted")
    
    
    if request.method == 'PUT':
        try:
        
            obj = RequestList.objects.get(request_id=request_id)
        except RequestList.DoesNotExist:
            return Response({"error": "request_list not found."}, status=status.HTTP_404_NOT_FOUND)
        
        
        serializer = request_serializer(obj, data=request.data)
    
        if serializer.is_valid():
            serializer.save()  
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        
    if request.method == 'PATCH':
        try:
            
            obj = RequestList.objects.get(request_id=request_id)
        except RequestList.DoesNotExist:
            return Response({"error": "request_list not found."}, status=status.HTTP_404_NOT_FOUND)
        
        
        serializer = request_serializer(obj, data=request.data)
        
        
        if serializer.is_valid():
            serializer.save()  
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)






from django.db.models import Subquery, OuterRef

@api_view(['GET','POST','PUT','PATCH','DELETE'])


def request_list_2(request, request_id=None):
    requests_with_po_status = RequestMaster.objects.annotate(
    po_status=Subquery(
        po_master.objects.filter(
            PO_id=OuterRef('request__request_id')  # Match PO_id with request_id
        ).values('status')[:1]  # Fetch the status field
    )
)

    # Example usage
    for request in requests_with_po_status:
        return Response(f"RequestMaster ID: {request.request_id}, PO Status: {request.po_status}")
