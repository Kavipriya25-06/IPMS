from django.shortcuts import render

from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status

from new_app_structure.models import VendorList
from new_app_structure.Vendor_list.serializers import vendor_list_serializer




@api_view(['GET','POST','PUT','PATCH','DELETE'])
def vendor_list(request, vendor_id=None):
    if request.method == 'PUT':
        try:
            # Get the existing BOMMaster object by ID
            obj = VendorList.objects.get(vendor_id=vendor_id)
        except VendorList.DoesNotExist:
            return Response({"error": "vendor id not found."}, status=status.HTTP_404_NOT_FOUND)
        
        # Update the BOMMaster object with the new data
        serializer = vendor_list_serializer(obj, data=request.data)
        
        # Check if the data is valid
        if serializer.is_valid():
            serializer.save()  # Save the updated object
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    if request.method == 'PATCH':
        try:
            # Get the existing BOMMaster object by ID
            obj = VendorList.objects.get(vendor_id=vendor_id)
        except VendorList.DoesNotExist:
            return Response({"error": "BOMMaster not found."}, status=status.HTTP_404_NOT_FOUND)
        
        # Update the BOMMaster object with the new data
        serializer = vendor_list_serializer(obj, data=request.data, partial = True)
        
        # Check if the data is valid
        if serializer.is_valid():
            serializer.save()  # Save the updated object
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    if request.method =='GET':
        obj= VendorList.objects.all()
        serializers=vendor_list_serializer(obj,many=True)
        return Response(serializers.data)
    
    if request.method =='POST':
        data=request.data
        serializers=vendor_list_serializer(data=data)
        if serializers.is_valid():
            serializers.save()
            return Response(serializers.data)
        return Response(serializers.errors)


