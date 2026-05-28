from urllib import request
from rest_framework.response import Response
from new_app_structure.models import price_table
from rest_framework.decorators import api_view

from new_app_structure.last_price.serializers import  RequestMasterSerializer, price_table_serializer


from rest_framework import status

@api_view(['GET', 'POST','PUT','POST','DELETE'])

def price_tables(request,id=None):
    
    if request.method == 'GET':
        if id:
            try:
                obj = price_table.objects.get(id=id)
                serializer = price_table_serializer(obj)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except price_table.DoesNotExist:
                return Response({"error": "ID not found."}, status=status.HTTP_404_NOT_FOUND)
        else:
            objs = price_table.objects.all()
            serializer = price_table_serializer(objs, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        
    if request.method=='POST':
        data=request.data
        serializer=price_table_serializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data,status=status.HTTP_200_OK)
        
        else:
            return Response(status=status.HTTP_404_NOT_FOUND)
        
    if request.method=='PUT':
        data=request.data
        obj=price_table.objects.get(id=id)
        serializer=price_table_serializer(obj,data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data,status=status.HTTP_200_OK)
        
        else:
            return Response(status=status.HTTP_404_NOT_FOUND)
        
    if request.method=='PATCH':
        data=request.data
        obj=price_table.objects.get(id=id)
        serializer=price_table_serializer(obj,data=data,partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data,status=status.HTTP_200_OK)
        
        else:
            return Response(status=status.HTTP_404_NOT_FOUND)
        
        
    if request.method == 'DELETE':
        try:
            obj = price_table.objects.get(id=id)
            obj.delete()
            return Response({"message": " entry deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
        except price_table.DoesNotExist:
            return Response({"error": "ID not found."}, status=status.HTTP_404_NOT_FOUND)





from new_app_structure.models import price_table, RequestMaster

from new_app_structure.last_price.serializers import price_table_serializer, RequestMasterWithPriceSerializer


@api_view(["GET"])
def request_master_with_price_view(request):
    queryset = RequestMaster.objects.all()
    serializer = RequestMasterSerializer(queryset, many=True)
    return Response(serializer.data)






