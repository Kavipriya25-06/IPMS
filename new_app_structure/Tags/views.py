from urllib import request
from rest_framework.response import Response
from new_app_structure.Tags.serilaizers import tagsSerializer, tagsSerializer_2
from new_app_structure.models import ComponentMaster, tags_table
from rest_framework.decorators import api_view
from rest_framework import status

@api_view(['GET', 'POST','PUT','POST','DELETE'])

def tags_view(request,id=None):
    
    if request.method == 'GET':
        if id:
            try:
                obj = tags_table.objects.get(id=id)
                serializer = tagsSerializer(obj)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except tags_table.DoesNotExist:
                return Response({"error": "ID not found."}, status=status.HTTP_404_NOT_FOUND)
        else:
            objs = tags_table.objects.all()
            serializer = tagsSerializer(objs, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        
    if request.method =='POST':
        data=request.data
        serializers=tagsSerializer(data=data)
        if serializers.is_valid():
            serializers.save()
            return Response(serializers.data)
        return Response(serializers.errors)
    
    if request.method=='PUT':
        data=request.data
        obj=tags_table.objects.get(id=id)
        serializer=tagsSerializer(obj,data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data,status=status.HTTP_200_OK)
        
        else:
            return Response(status=status.HTTP_404_NOT_FOUND)
        
    if request.method=='PATCH':
        data=request.data
        obj=tags_table.objects.get(id=id)
        serializer=tagsSerializer(obj,data=data,partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data,status=status.HTTP_200_OK)
        
        else:
            return Response(status=status.HTTP_404_NOT_FOUND)
        
        
    if request.method == 'DELETE':
        try:
            obj = tags_table.objects.get(id=id)
            obj.delete()
            return Response({"message": " entry deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
        except tags_table.DoesNotExist:
            return Response({"error": "ID not found."}, status=status.HTTP_404_NOT_FOUND)
        
        
        






from collections import defaultdict
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
from rest_framework.pagination import PageNumberPagination
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response
from new_app_structure.models import ComponentMaster, tags_table
from new_app_structure.Tags.serilaizers import tagsSerializer_2
from django.db.models import Q  # Import Q for complex queries

# Define a custom pagination class based on PageNumberPagination
class CustomListPagination(PageNumberPagination):
    page_size = 15  # Number of items per page
    page_size_query_param = "page_size"  # Allow client to specify page size
    max_page_size = 100  # Limit maximum page size

# class test_search_list(GenericAPIView):
#     serializer_class = tagsSerializer_2
#     pagination_class = CustomListPagination
#     filter_backends = [DjangoFilterBackend, SearchFilter]
#     filterset_fields = ['tags_choices__tags']  # Enable filtering by tag name
#     search_fields = [
#         'component_id__component_type',  # Search by component type
#         'component_id__component_specification',  # Search by component specification
#         'component_id__category',
#     ]

#     def get_queryset(self):
#         # Get the query from the request for both filtering and searching
#         tag_query = self.request.query_params.get('tags_choices__tags', '').strip()
#         search_query = self.request.query_params.get('search', '').strip()

#         # Start with the base queryset with related fields for optimization
#         queryset = tags_table.objects.select_related('component_id', 'tags_choices')

#         # Apply filter based on exact tag name if provided
#         if tag_query:
#             queryset = queryset.filter(tags_choices__tags__icontains=tag_query)  # Filter by tag

#         # Apply search across multiple fields if search query is provided
#         if search_query:
#             queryset = queryset.filter(
#                 Q(component_id__component_type__icontains=search_query) |
#                 Q(component_id__component_specification__icontains=search_query) |
#                 Q(component_id__category__icontains=search_query)
#             )

#         return queryset

#     def get(self, request, *args, **kwargs):
#         # Apply filters and search
#         filtered_queryset = self.filter_queryset(self.get_queryset())

#         # Fetch all components
#         all_components = ComponentMaster.objects.values(
#             "component_id", "component_type", "component_specification", "unit_of_measurement", "category"
#         )

#         # Consolidate data for components
#         grouped_data = {
#             comp["component_id"]: {"component_id": comp, "tags": set()} for comp in all_components
#         }

#         # Populate tags for components in the filtered queryset
#         for tag_entry in filtered_queryset:
#             component_key = tag_entry.component_id.component_id
#             if component_key in grouped_data:
#                 grouped_data[component_key]["tags"].add(tag_entry.tags_choices.tags.lower())

#         # Filter grouped data to match both search and tag filters
#         tag_query = self.request.query_params.get('tags_choices__tags', '').strip().lower()
#         search_query = self.request.query_params.get('search', '').strip().lower()

#         grouped_response_data = [
#             {
#                 "component_id": data["component_id"],
#                 "tags": list(data["tags"]),
#             }
#             for data in grouped_data.values()
#             if (
#                 # Match tag query if provided
#                 (not tag_query or any(tag_query == tag for tag in data["tags"])) and
#                 # Match search query if provided
#                 (not search_query or any(
#                     search_query in str(data["component_id"].get(key, "")).lower()
#                     for key in ["component_type", "component_specification", "category"]
#                 ))
#             )
#         ]

#         # Apply custom pagination to the grouped response data
#         paginator = self.pagination_class()
#         paginated_queryset = paginator.paginate_queryset(grouped_response_data, request, view=self)

#         # Return the paginated response
#         return paginator.get_paginated_response(paginated_queryset)


class test_search_list(GenericAPIView):
    serializer_class = tagsSerializer_2
    pagination_class = CustomListPagination
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['tags_choices__tags']  # Enable filtering by tag name

    def get_queryset(self):
        # Get filter values from query parameters
        tag_query = self.request.query_params.get('tags_choices__tags', '').strip()
        component_type_query = self.request.query_params.get('component_type', '').strip()
        category_query = self.request.query_params.get('category', '').strip()
        search_query = self.request.query_params.get('search', '').strip()

        # Base queryset
        queryset = tags_table.objects.select_related('component_id', 'tags_choices')

        # Apply tag filter
        if tag_query:
            queryset = queryset.filter(tags_choices__tags__icontains=tag_query.lower())

        # Apply component_type filter
        if component_type_query:
            queryset = queryset.filter(component_id__component_type__icontains=component_type_query)

        # Apply category filter
        if category_query:
            queryset = queryset.filter(component_id__category__icontains=category_query)

        # Apply search filter (only for component_specification)
        if search_query:
            queryset = queryset.filter(component_id__component_specification__icontains=search_query)

        return queryset

    def get(self, request, *args, **kwargs):
        # Apply filters and search
        filtered_queryset = self.filter_queryset(self.get_queryset())

        # Fetch all components
        all_components = ComponentMaster.objects.values(
            "component_id", "component_type", "component_specification", "unit_of_measurement", "category", "tally_reference"
        )

        # Consolidate data for components
        grouped_data = {
            comp["component_id"]: {"component_id": comp, "tags": set()} for comp in all_components
        }

        # Populate tags for components in the filtered queryset
        for tag_entry in filtered_queryset:
            component_key = tag_entry.component_id.component_id
            if component_key in grouped_data:
                grouped_data[component_key]["tags"].add(tag_entry.tags_choices.tags.lower())

        # Extract filter parameters
        tag_query = request.query_params.get('tags_choices__tags', '').strip().lower()
        component_type_query = request.query_params.get('component_type', '').strip().lower()
        category_query = request.query_params.get('category', '').strip().lower()
        search_query = request.query_params.get('search', '').strip().lower()

        # Filter grouped data
        grouped_response_data = [
            {
                "component_id": data["component_id"],
                "tags": list(data["tags"]),
            }
            for data in grouped_data.values()
            if (
                # Match tag filter
                (not tag_query or any(tag_query.lower() in tag.lower() for tag in data["tags"])) and
                # Match component_type filter
                (not component_type_query or component_type_query in data["component_id"].get("component_type", "").lower()) and
                # Match category filter
                (not category_query or category_query in data["component_id"].get("category", "").lower()) and
                # Match search filter (for component_specification)
                (not search_query or search_query in data["component_id"].get("component_specification", "").lower())
            )
        ]

        # Apply custom pagination to the grouped response data
        paginator = self.pagination_class()
        paginated_queryset = paginator.paginate_queryset(grouped_response_data, request, view=self)

        # Return the paginated response
        return paginator.get_paginated_response(paginated_queryset)




class test_tag_list(GenericAPIView):
    serializer_class = tagsSerializer_2

    def get_queryset(self):
        # Fetch all components and prefetch their related tags
        return ComponentMaster.objects.prefetch_related('tags_table_set__tags_choices')

    def get(self, request, *args, **kwargs):
        # Get all components
        components = self.get_queryset()

        # Create the response structure
        response_data = []
        for component in components:
            tags = [tag.tags_choices.tags for tag in component.tags_table_set.all()]
            response_data.append({
                "component_id": {
                    "component_id": component.component_id,
                    "component_type": component.component_type,
                    "component_specification": component.component_specification,
                    "unit_of_measurement": component.unit_of_measurement,
                    "category": component.category,
                },
                "tags": tags  # Include tags or empty list if none
            })

        # Return the full response without filtering or pagination
        return Response(response_data, status=status.HTTP_200_OK)
