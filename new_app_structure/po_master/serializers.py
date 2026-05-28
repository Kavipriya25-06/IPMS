from decimal import Decimal, ROUND_HALF_UP
from rest_framework import serializers
from new_app_structure.models import po_master, cart

class CartSerializer(serializers.ModelSerializer):
    class Meta:
        model = cart
        fields = [
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
            'request_id',
            'gstn'

            
        ]

class get_po_master_serializer(serializers.ModelSerializer):
    cart_details = CartSerializer(source='cart_id', read_only=True)  # Nested serializer for cart details

    class Meta:
        model = po_master
        fields = '__all__'

        
class po_master_Post(serializers.ModelSerializer):
    class Meta:
        model = po_master
        fields = [
            
            'PO_id',
            'status',
            'cart_id',
            'inward_status',
            'edited_quantity',
            'edited_total_cost',
        ]
        
        extra_kwargs = {
            # allow partial updates
            'edited_quantity': {'required': False},
            'edited_total_cost': {'required': False},
        }

    def _calc_total(self, cart_obj: cart, qty: int) -> Decimal:
        unit = Decimal(cart_obj.unit_price or 0)
        gst = Decimal(cart_obj.GST or 0)
        qty_dec = Decimal(qty or 0)
        total = qty_dec * unit * (Decimal(1) + (gst / Decimal('100')))
        # normalize to 2 decimals
        return total.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

    def create(self, validated_data):
        c = validated_data['cart_id']  # cart instance because of FK
        # default from cart if caller didn’t send these
        if not validated_data.get('edited_quantity'):
            validated_data['edited_quantity'] = int(c.quantity or 0)

        if not validated_data.get('edited_total_cost'):
            # You can either use cart.total_cost or compute again.
            # Here we compute to keep it consistent:
            validated_data['edited_total_cost'] = self._calc_total(
                c, validated_data['edited_quantity']
            )

        return super().create(validated_data)

    def update(self, instance, validated_data):
        c = instance.cart_id  # cart linked to this PO master

        # If quantity provided but total not provided, compute total
        if 'edited_quantity' in validated_data and 'edited_total_cost' not in validated_data:
            qty = int(validated_data.get('edited_quantity') or 0)
            validated_data['edited_total_cost'] = self._calc_total(c, qty)

        # Optional: basic guardrails
        if 'edited_quantity' in validated_data:
            q = validated_data['edited_quantity']
            if q is not None and q < 0:
                raise serializers.ValidationError({'edited_quantity': 'Must be >= 0'})

        return super().update(instance, validated_data)