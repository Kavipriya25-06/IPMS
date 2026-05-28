from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from new_app_structure.models import VendorSubList
from new_app_structure.vendor_sub_list.serializers import VendorSubList_serializers

@api_view(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
def vendor_sub_list(request,vendor_id=None, id=None):
    if request.method == 'GET':
        if id:
            try:
                obj = VendorSubList.objects.get(vendor_id=vendor_id,id=id)
                serializer = VendorSubList_serializers(obj)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except VendorSubList.DoesNotExist:
                return Response({"error": "ID not found."}, status=status.HTTP_404_NOT_FOUND)
        else:
            objs = VendorSubList.objects.all()
            serializer = VendorSubList_serializers(objs, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'POST':
        serializer = VendorSubList_serializers(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'PUT':
        try:
            obj = VendorSubList.objects.get(id=id)
        except VendorSubList.DoesNotExist:
            return Response({"error": "ID not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = VendorSubList_serializers(obj, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'PATCH':
        try:
            obj = VendorSubList.objects.get(id=id)
        except VendorSubList.DoesNotExist:
            return Response({"error": "ID not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = VendorSubList_serializers(obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        try:
            obj = VendorSubList.objects.get(id=id)
            obj.delete()
            return Response({"message": "Vendor sub-list entry deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
        except VendorSubList.DoesNotExist:
            return Response({"error": "ID not found."}, status=status.HTTP_404_NOT_FOUND)
