from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status

from new_app_structure.models import BOMList, ComponentMaster, VendorList, Inventory, VendorMaster, BOMMaster, RequestList, RequestMaster
from new_app_structure.BOM_list_api.serializers import BOMlist_serializers

from rest_framework.pagination import PageNumberPagination

@api_view(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
def BOM_list(request, bom_id=None):
    """
    Handles CRUD operations for BOMList objects.

    GET:
    * Retrieves all BOMList objects if no `bom_id` is provided.
    * Retrieves a single BOMList object by `bom_id` if provided.

    POST:
    * Creates a new BOMList object with the provided data.

    PUT:
    * Updates an existing BOMList object with the provided data.

    PATCH:
    * Updates an existing BOMList object with partial data.

    DELETE:
    * Deletes an existing BOMList object by `bom_id`.
    """
    
    if request.method == 'PUT':
        try:
            
            # Get the existing BOMList object by ID
            obj = BOMList.objects.get(bom_id=bom_id)
        except BOMList.DoesNotExist:
            return Response({"error": "BOMList not found."}, status=status.HTTP_404_NOT_FOUND)
        
        # Update the BOMList object with the new data
        serializer = BOMlist_serializers(obj, data=request.data)
        
        # Check if the data is valid
        if serializer.is_valid():
            serializer.save()  # Save the updated object
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    if request.method == 'PATCH':
        try:
            # Get the existing BOMList object by ID
            obj = BOMList.objects.get(bom_id=bom_id)
        except BOMList.DoesNotExist:
            return Response({"error": "BOMList not found."}, status=status.HTTP_404_NOT_FOUND)
        
        # Update the BOMList object with partial data
        serializer = BOMlist_serializers(obj, data=request.data, partial=True)
        
        # Check if the data is valid
        if serializer.is_valid():
            serializer.save()  # Save the updated object
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    if request.method == 'GET':
        if bom_id:
            
             obj = BOMList.objects.get(bom_id=bom_id)
             serializer=BOMlist_serializers(obj)
             return Response("Bomid not found",status=status.HTTP_404_NOT_FOUND)
        else:
            obj = BOMList.objects.select_related()
            serializers = BOMlist_serializers(obj, many=True)
            return Response(serializers.data, status=status.HTTP_200_OK)
    
    #paginartion

    # if request.method == 'GET':
    #     if bom_id:
    #         try:
    #             obj = BOMList.objects.get(bom_id=bom_id)
    #             serializer = BOMlist_serializers(obj)
    #             return Response(serializer.data, status=status.HTTP_200_OK)
    #         except BOMList.DoesNotExist:
    #             return Response({"error": "BOM ID not found"}, status=status.HTTP_404_NOT_FOUND)
    #     else:
    #         queryset = BOMList.objects.select_related().all()

    #         # Initialize pagination
    #         paginator = PageNumberPagination()
    #         paginator.page_size = 10  # Set the number of items per page or rely on global settings
    #         paginated_queryset = paginator.paginate_queryset(queryset, request)

    #         # Serialize paginated data
    #         serializers = BOMlist_serializers(paginated_queryset, many=True)

    #         # Return paginated response
    #         return paginator.get_paginated_response(serializers.data)

    
    if request.method == 'POST':
        serializers = BOMlist_serializers(data=request.data)
        if serializers.is_valid():
            serializers.save()
            return Response(serializers.data, status=status.HTTP_201_CREATED)
        return Response(serializers.errors, status=status.HTTP_400_BAD_REQUEST)
    
    if request.method == 'DELETE':
        try:
            obj = BOMList.objects.get(bom_id=bom_id)
            obj.delete()
            return Response({"message": "BOMList deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
        except BOMList.DoesNotExist:
            return Response({"error": "BOMList not found."}, status=status.HTTP_404_NOT_FOUND)
