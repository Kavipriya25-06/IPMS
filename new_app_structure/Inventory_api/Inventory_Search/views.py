from collections import defaultdict
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
from rest_framework.pagination import PageNumberPagination
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response
from new_app_structure.models import meta_tags
from new_app_structure.Inventory_api.Inventory_Search.serializers import meta_tagsSerializer

# Define a custom pagination class based on PageNumberPagination
class CustomListPagination(PageNumberPagination):
    page_size = 10  # Number of items per page
    page_size_query_param = "page_size"  # Allow client to specify page size
    max_page_size = 100  # Limit maximum page size


class meta_search_list(GenericAPIView):
    serializer_class = meta_tagsSerializer
    pagination_class = CustomListPagination
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['tags']  # Enable filtering by tag name
    search_fields = [
        'component_id__component_type',  # Search by component type
        'component_id__component_specification',  # Search by component specification
        'tags',  # Search by tag name
    ]

    def get_queryset(self):
        # Base queryset with related fields for optimization
        return meta_tags.objects.select_related('component_id').all()

    def get(self, request, *args, **kwargs):
        # Apply filters and search
        filtered_queryset = self.filter_queryset(self.get_queryset())

        # Consolidate tags for each component_id before pagination
        grouped_data = defaultdict(lambda: {"tags": set()})
        for tag_entry in filtered_queryset:
            component_key = tag_entry.component_id.component_id  # Use component_id as the grouping key
            if "component_id" not in grouped_data[component_key]:
                grouped_data[component_key]["component_id"] = {
                    "component_id": tag_entry.component_id.component_id,
                    "component_type": tag_entry.component_id.component_type,
                    "component_specification": tag_entry.component_id.component_specification,
                    "unit_of_measurement": tag_entry.component_id.unit_of_measurement,
                    "category": tag_entry.component_id.category
                }
            # Add the tag to the set to avoid duplicates
            grouped_data[component_key]["tags"].add(tag_entry.tags)

        # Convert grouped data to a list and tags to lists
        grouped_response_data = [
            {
                "component_id": data["component_id"],
                "tags": list(data["tags"]),  # Convert set to list for JSON compatibility
            }
            for data in grouped_data.values()
        ]

        # Apply custom pagination to the grouped response data
        paginator = self.pagination_class()
        paginated_queryset = paginator.paginate_queryset(grouped_response_data, request, view=self)

        # Return the paginated response
        return paginator.get_paginated_response(paginated_queryset)
