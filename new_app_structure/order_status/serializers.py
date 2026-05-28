from new_app_structure.models import  order_status


from rest_framework import serializers


from rest_framework import serializers
from new_app_structure.models import cart,order_status,po_master


class CartSerializer(serializers.ModelSerializer):
    class Meta:
        model = cart
        fields = [
            'component_id',
        ]



class POMasterSerializer(serializers.ModelSerializer):
    cart_details = CartSerializer(source='cart_id', read_only=True)


    class Meta:
        model = po_master
        fields = [
            'PO_id',
            'status',
            'cart_details',
        ]



class get_OrderStatusSerializer(serializers.ModelSerializer):
    po_master_details = POMasterSerializer(source='po_master_id', read_only=True)


    class Meta:
        model = order_status
        fields = [
            'po_master_details',
            'order_placed_status',
            'order_placed_date_time',
            'customer_status',
            'customer_date_time',
            'received_status',
            'received_date',
        ]

class order_status_serializer(serializers.ModelSerializer):
    class Meta:
        model = order_status
        fields = '__all__'
