from rest_framework import serializers
from new_app_structure.models import  po_list, cart, po_master

class CartSerializer(serializers.ModelSerializer):
    class Meta:
        model = cart
        fields = [
            'vendor_name',
            'quantity',
            'vendor_id',
            'total_cost',
            'id',
            'gstn',
            
        ]
        

class get_PoListSerializer(serializers.ModelSerializer):
    cart_details = CartSerializer(source='cart_id', read_only=True)
    status = serializers.SerializerMethodField() 

    class Meta:
        model = po_list
        fields = [
            'id',
            'status',
            'cart_details' , # Includes all cart details through nested serializer
            'date',

        ]

    def get_status(self, obj):
        latest_master = po_master.objects.filter(PO_id=obj).order_by('-id').first()
        return latest_master.status if latest_master else None


class post_PoListSerializer(serializers.ModelSerializer):

    class Meta:
        model = po_list
        fields = '__all__'