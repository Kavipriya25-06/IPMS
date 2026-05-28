from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status


from new_app_structure.models import order_status
from new_app_structure.order_status.serializers import order_status_serializer




@api_view(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
def order_view(request, id=None):
    if request.method == 'GET':
        if id:
            # Retrieve a single PO Master by ID
            obj = get_object_or_404(order_status, id=id)
            serializer = order_status_serializer(obj)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            # Retrieve all PO Master records
            objs = order_status.objects.all()
            serializer = order_status_serializer(objs, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
   
    elif request.method == 'POST':
        # Create a new PO Master record
        serializer = order_status_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
   
    elif request.method == 'PUT':
        # Full update of a PO Master record
        obj = get_object_or_404(order_status, id=id)
        serializer = order_status_serializer(obj, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
   
    elif request.method == 'PATCH':
        # Partial update of a PO Master record
        obj = get_object_or_404(order_status, id=id)
        serializer = order_status_serializer(obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
   
    elif request.method == 'DELETE':
        # Delete a PO Master record
        obj = get_object_or_404(order_status, id=id)
        obj.delete()
        return Response({"message": "PO Master record deleted successfully."}, status=status.HTTP_204_NO_CONTENT)