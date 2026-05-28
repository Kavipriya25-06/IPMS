from django.shortcuts import get_object_or_404, render
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from new_app_structure.models import po_list,cart
from new_app_structure.PO_list.serializers import get_PoListSerializer, post_PoListSerializer


@api_view(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
def PO_list(request, id=None):
    if request.method == 'GET':
        if id:
            # Fetch a specific PO by PO_id
            
            try:
                obj = po_list.objects.get(id=id)
                serializer = get_PoListSerializer(obj)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except po_list.DoesNotExist:
                return Response({"error": "PO not found."}, status=status.HTTP_404_NOT_FOUND)
        else:
            # Fetch all POs
            objs = po_list.objects.all()
            serializer = get_PoListSerializer(objs, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

    if request.method == 'POST':
        serializer = post_PoListSerializer(data=request.data)
        if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.data)
            
    elif request.method in ['PUT', 'PATCH']:
        if not id:
            return Response({"error": "ID is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        obj = get_object_or_404(po_list, id=id)
        partial = request.method == 'PATCH'
        serializer = post_PoListSerializer(obj, data=request.data, partial=partial)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        if not id:
            return Response({"error": "ID is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        obj = get_object_or_404(po_list, id=id)
        obj.delete()
        return Response({"message": "Deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

        