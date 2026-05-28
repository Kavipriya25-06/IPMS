from urllib import request
from rest_framework.response import Response
from new_app_structure.Tags.create_tags.serializer import create_tagsSerializer
from new_app_structure.models import create_tags
from rest_framework.decorators import api_view
from rest_framework import status

@api_view(['GET', 'POST','PUT','POST','DELETE'])

def create_tags_view(request,id=None):
    
    if request.method == 'GET':
        if id:
            try:
                obj = create_tags.objects.get(id=id)
                serializer = create_tagsSerializer(obj)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except create_tags.DoesNotExist:
                return Response({"error": "ID not found."}, status=status.HTTP_404_NOT_FOUND)
        else:
            objs = create_tags.objects.all()
            serializer = create_tagsSerializer(objs, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        
    if request.method =='POST':
        data=request.data
        serializers=create_tagsSerializer(data=data)
        if serializers.is_valid():
            serializers.save()
            return Response(serializers.data)
        return Response(serializers.errors)
    
    if request.method=='PUT':
        data=request.data
        obj=create_tags.objects.get(id=id)
        serializer=create_tagsSerializer(obj,data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data,status=status.HTTP_200_OK)
        
        else:
            return Response(status=status.HTTP_404_NOT_FOUND)
        
    if request.method=='PATCH':
        data=request.data
        obj=create_tags.objects.get(id=id)
        serializer=create_tagsSerializer(obj,data=data,partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data,status=status.HTTP_200_OK)
        
        else:
            return Response(status=status.HTTP_404_NOT_FOUND)
        
        
    if request.method == 'DELETE':
        try:
            obj = create_tags.objects.get(id=id)
            obj.delete()
            return Response({"message": " entry deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
        except create_tags.DoesNotExist:
            return Response({"error": "ID not found."}, status=status.HTTP_404_NOT_FOUND)