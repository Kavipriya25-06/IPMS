from rest_framework import serializers
from new_app_structure.models import VendorProductImage

class VendorProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = VendorProductImage
        # fields = ['vendor_product','id', 'image', 'uploaded_at']
        fields = ['image', 'id']