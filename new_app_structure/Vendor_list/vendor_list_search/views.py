from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import GenericAPIView
from django.db.models import Q
from django.contrib.postgres.search import SearchVector
from django.db.models.expressions import RawSQL

from new_app_structure.models import VendorMaster, VendorList
class VendorSearchList(GenericAPIView):
    def get_queryset(self):
        return VendorMaster.objects.all()  # Vendor data source

    def get(self, request, *args, **kwargs):
        # Get search query
        search_query = request.query_params.get("search", "").strip().lower()

        # If no search query, return an error message
        if not search_query:
            return Response({"message": "Please provide a search query."}, status=status.HTTP_400_BAD_REQUEST)

        # Advanced search with REGEXP (PostgreSQL required)
        matching_products = VendorMaster.objects.filter(
            Q(product_description__iregex=rf".*{search_query}.*") |
            Q(component_type__iregex=rf".*{search_query}.*") |
            Q(component_specification__iregex=rf".*{search_query}.*")
        )

        # Extract unique vendor IDs
        vendor_ids = matching_products.values_list("vendor", flat=True).distinct()

        # Fetch vendor details based on the filtered vendor IDs
        matching_vendors = VendorList.objects.filter(vendor_id__in=vendor_ids)

        # Prepare response data
        vendor_data = [
            {
                "vendor_id": vendor.vendor_id,
                "vendor_name": vendor.vendor_name,
                "gstn": vendor.gstn,
                "active": vendor.active
            }
            for vendor in matching_vendors
        ]

        return Response(vendor_data, status=status.HTTP_200_OK)
