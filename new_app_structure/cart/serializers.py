from rest_framework import serializers
from new_app_structure.models import cart


class cart_serializer(serializers.ModelSerializer):
    class Meta:
        model = cart
        fields=[
            'component_id',
            'category',
            'component_type',
            'component_specification',
            'unit_of_measurement',
            'vendor_name',
            'quantity',
            'vendor_id',
            'unit_price',
            'GST',
            'total_cost',
            'order_placed',
            'id',
            'date',
            'request_id',
            'request_list_id',
            'gstn'
        ]
        

