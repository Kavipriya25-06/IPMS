from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from new_app_structure.models import po_master
from new_app_structure.po_master.serializers import get_po_master_serializer, po_master_Post




@api_view(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
def po_master_view(request, id=None):

    """
    Handles CRUD operations for PO Master objects.

    GET:
    * Retrieves all PO Master objects if no `id` is provided.
    * Retrieves a single PO Master object by `id` if provided.

    POST:
    * Creates a new PO Master object with the provided data.

    PUT:
    * Updates an existing PO Master object with the provided data.

    PATCH:
    * Partially updates an existing PO Master object with the provided data.

    DELETE:
    * Deletes an existing PO Master object by `id`.
    """
    
    if request.method == 'GET':
        if id:
            try:
                # Fetch the single object
                obj = po_master.objects.get(id=id)
                serializer = get_po_master_serializer(obj)  # many=True is NOT needed here
                return Response(serializer.data, status=status.HTTP_200_OK)
            except po_master.DoesNotExist:
                return Response({"error": "ID not found"}, status=status.HTTP_404_NOT_FOUND)
        else:
            # Fetch all objects
            obj = po_master.objects.all()
            serializers = get_po_master_serializer(obj, many=True)
            return Response(serializers.data, status=status.HTTP_200_OK)

    
    if request.method == 'POST':
        serializers = po_master_Post(data=request.data)
        if serializers.is_valid():
            serializers.save()
            return Response(serializers.data, status=status.HTTP_201_CREATED)
        return Response(serializers.errors, status=status.HTTP_400_BAD_REQUEST)
    
    
    if request.method == 'PUT':
        if not id:
            return Response({"error": "PO_id is required for updates."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            obj = po_master.objects.get(id=id)
        except po_master.DoesNotExist:
            return Response({"error": "PO not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = po_master_Post(obj, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "PO updated successfully.", "data": serializer.data}, status=status.HTTP_200_OK)
        return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'PATCH':
        if not id:
            return Response({"error": "PO_id is required for partial updates."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            obj = po_master.objects.get(id=id)
        except po_master.DoesNotExist:
            return Response({"error": "PO not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = po_master_Post(obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    
    if request.method == 'DELETE':
        try:
            obj = po_master.objects.get(id=id)
            obj.delete()
            return Response({"message": "BOMList deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
        except po_master.DoesNotExist:
            return Response({"error": "BOMList not found."}, status=status.HTTP_404_NOT_FOUND)





