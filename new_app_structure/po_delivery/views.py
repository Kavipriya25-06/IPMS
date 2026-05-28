from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from new_app_structure.models import PODelivery
from .serializers import PODeliverySerializer, PODeliveryGetSerializer

@api_view(['GET', 'POST', 'PATCH', 'DELETE'])
def po_delivery_view(request, pk=None):
    if request.method == 'GET':
        if pk:
            obj = PODelivery.objects.get(pk=pk)
            serializer = PODeliveryGetSerializer(obj)
            return Response(serializer.data)
        else:
            po_master_id = request.GET.get('po_master')
            po_id = request.GET.get('po_id')  

            queryset = PODelivery.objects.all()
            if po_id:
                queryset = queryset.filter(po_master__PO_id=po_id)  # filter by string po_id
            elif po_master_id:
                queryset = queryset.filter(po_master_id=po_master_id)  # fallback to numeric ID

            serializer = PODeliveryGetSerializer(queryset, many=True)
            return Response(serializer.data)


    elif request.method == 'POST':
        serializer = PODeliverySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'PATCH':
        obj = get_object_or_404(PODelivery, id=pk)
        serializer = PODeliverySerializer(obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        obj = get_object_or_404(PODelivery, id=pk)
        obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
