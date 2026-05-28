from urllib import request
from rest_framework.response import Response
from new_app_structure.models import  meta_tags, tags_table
from rest_framework.decorators import api_view
from rest_framework import status

from new_app_structure.Tags.meta.serializers import metaSerializer

@api_view(['GET', 'POST','PUT','POST','DELETE'])

def meta_view(request,id=None):
    
    """
    Handle HTTP requests for meta tags.

    Supports the following methods:
    - GET: Retrieve a specific meta tag by ID or a list of all meta tags.
    - POST: Create a new meta tag with the provided data.
    - PUT: Update an existing meta tag specified by ID with the provided data.
    - PATCH: Partially update an existing meta tag specified by ID.
    - DELETE: Delete the meta tag specified by ID.

    Args:
        request: The HTTP request object containing method and data.
        id: Optional; The ID of the meta tag to retrieve, update, or delete.

    Returns:
        A Response object with serialized data for GET, POST, PUT, and PATCH requests,
        or a success/error message for DELETE requests, along with an appropriate HTTP status code.
    """

    if request.method == 'GET':
        if id:
            try:
                obj = meta_tags.objects.get(id=id)
                serializer = metaSerializer(obj)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except meta_tags.DoesNotExist:
                return Response({"error": "ID not found."}, status=status.HTTP_404_NOT_FOUND)
        else:
            objs = meta_tags.objects.all()
            serializer = metaSerializer(objs, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

    if request.method =='POST':
        data=request.data
        serializers=metaSerializer(data=data)
        if serializers.is_valid():
            serializers.save()
            return Response(serializers.data)
        return Response(serializers.errors)
    
    if request.method=='PUT':
        data=request.data
        obj=meta_tags.objects.get(id=id)
        serializer=metaSerializer(obj,data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data,status=status.HTTP_200_OK)
        
        else:
            return Response(status=status.HTTP_404_NOT_FOUND)
        
    if request.method=='PATCH':
        data=request.data
        obj=meta_tags.objects.get(id=id)
        serializer=metaSerializer(obj,data=data,partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data,status=status.HTTP_200_OK)
        
        else:
            return Response(status=status.HTTP_404_NOT_FOUND)
        
        
    if request.method == 'DELETE':
        try:
            obj = meta_tags.objects.get(id=id)
            obj.delete()
            return Response({"message": " entry deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
        except meta_tags.DoesNotExist:
            return Response({"error": "ID not found."}, status=status.HTTP_404_NOT_FOUND)



from rest_framework import filters, status
from rest_framework.response import Response
from rest_framework.generics import GenericAPIView
from new_app_structure.models import tags_table


class PostAJobListView_meta(GenericAPIView):
    serializer_class = metaSerializer
    queryset = (
        meta_tags.objects.select_related('component_id')
        .all()
    )
    filter_backends = [filters.SearchFilter]
    search_fields = [
        'component_id__component_type',
        'component_id__component_id',  # Related field
        'tags',                        # Direct field
    ]

    def get(self, request, *args, **kwargs):
        """
        Handle GET requests for listing job posts.
        Supports search, filtering, and pagination.
        """
        # Get the filtered queryset
        queryset = self.filter_queryset(self.get_queryset())

        # Paginate the queryset
        page = self.paginate_queryset(queryset)
        if page is not None:
            # If pagination is applied, get the paginated response
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        # If no pagination, return the full response
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)