from rest_framework import serializers

from new_app_structure.models import price_table


class price_table_serializer(serializers.ModelSerializer):
    component_id = serializers.CharField(source='product.component_id.component_id', read_only=True)
    # component_type = serializers.CharField(source='product.component_id.component_type', read_only=True)
    # component_specification = serializers.CharField(source='product.component_id.component_specification', read_only=True)
    # category = serializers.CharField(source='product.component_id.category', read_only=True)
    # unit_of_measurement = serializers.CharField(source='product.component_id.unit_of_measurement', read_only=True)

    class Meta:
        model=price_table
        fields='__all__'



from rest_framework import serializers
from new_app_structure.models import RequestMaster, VendorMaster


from new_app_structure.models import (
    price_table,
)  # adjust if your price_table model is elsewhere


class RequestMasterWithPriceSerializer(serializers.ModelSerializer):
    component_type = serializers.CharField(
        source="component.component_type", read_only=True
    )
    component_specification = serializers.CharField(
        source="component.component_specification", read_only=True
    )
    unit_of_measurement = serializers.CharField(
        source="component.unit_of_measurement", read_only=True
    )
    category = serializers.CharField(source="component.category", read_only=True)
    vendor_name = serializers.CharField(
        source="vendor.vendor_name", read_only=True
    )
    bom_detail = serializers.CharField(source="bom.bom.bom_name", read_only=True)
    product_id = serializers.CharField(source="vendor.product_id", read_only=True)
    component_id = serializers.CharField(
        source="component.component_id", read_only=True
    )
    request_id = serializers.CharField(source="request.request_id", read_only=True)
    bom_master_id = serializers.CharField(source="bom.id", read_only=True)
    bom_name = serializers.CharField(source="bom.bom.bom_name", read_only=True)
    quantity = serializers.CharField(source="bom.quantity", read_only=True)
    vendor_id = serializers.CharField(source="vendor.vendor_id", read_only=True)

    latest_price = serializers.SerializerMethodField()
    latest_tax = serializers.SerializerMethodField()

    class Meta:
        model = RequestMaster
        fields = [
            "request_id",
            "component_id",
            "bom_master_id",
            "status",
            "vendor_id",
            "product_id",
            "component_type",
            "component_specification",
            "unit_of_measurement",
            "category",
            "vendor_name",
            "bom_detail",
            "bom_name",
            "quantity",
            "qty",
            "assign",
            "id",
            "project_id",
            "approve",
            "cart_assign",
            "latest_price",
            "latest_tax",
        ]

    def get_latest_price(self, obj):
        return self._get_latest_value(obj, "price")

    def get_latest_tax(self, obj):
        return self._get_latest_value(obj, "tax")

def _get_latest_value(self, obj, field_name):
    try:
        # Get the vendor's product_id for this component
        from new_app_structure.models import VendorMaster

        vendor_product = VendorMaster.objects.filter(
            vendor_id=obj.vendor.vendor_id,
            component_id=obj.component
        ).first()

        if not vendor_product:
            return None

        # Now get the latest price_table entry for that product
        price_entry = (
            price_table.objects.filter(product=vendor_product)
            .order_by("-current_time")
            .first()
        )

        return getattr(price_entry, field_name, None) if price_entry else None

    except Exception as e:
        return None












# Assuming RequestMaster has component = ForeignKey(ComponentMaster)
class RequestMasterSerializer(serializers.ModelSerializer):
    component_type = serializers.CharField(source='component.component_type', read_only=True)
    component_specification = serializers.CharField(source='component.component_specification', read_only=True)
    price = serializers.SerializerMethodField()
    tax = serializers.SerializerMethodField()
    unit_of_measurement = serializers.CharField(
        source="component.unit_of_measurement", read_only=True
    )
    category = serializers.CharField(source="component.category", read_only=True)
    vendor_name = serializers.CharField(
        source="vendor.vendor_name", read_only=True
    )
    bom_detail = serializers.CharField(source="bom.bom.bom_name", read_only=True)
    product_id = serializers.CharField(source="vendor.product_id", read_only=True)
    component_id = serializers.CharField(
        source="component.component_id", read_only=True
    )
    request_id = serializers.CharField(source="request.request_id", read_only=True)
    bom_master_id = serializers.CharField(source="bom.id", read_only=True)
    bom_name = serializers.CharField(source="bom.bom.bom_name", read_only=True)
    quantity = serializers.CharField(source="bom.quantity", read_only=True)
    vendor_id = serializers.CharField(source="vendor.vendor_id", read_only=True)

    # latest_price = serializers.SerializerMethodField()
    # latest_tax = serializers.SerializerMethodField()


    class Meta:
        model = RequestMaster
        # fields = [
        #     'id', 'component', 'component_type', 'component_specification',
        #     'price', 'tax',  # Add more fields from RequestMaster as needed
        # ]
        fields = [
            "request_id",
            "component",
            "component_id",
            "bom_master_id",
            "status",
            "vendor_id",
            "product_id",
            "component_type",
            "component_specification",
            "unit_of_measurement",
            "category",
            "vendor_name",
            "bom_detail",
            "bom_name",
            "quantity",
            "qty",
            "assign",
            "id",
            "project_id",
            "approve",
            "cart_assign",
            "price",
            "tax",
        ]

    def get_price(self, obj):
        try:
            # Get the VendorMaster record that links vendor + component
            vendor_product = VendorMaster.objects.filter(
                vendor=obj.vendor,
                component_id=obj.component
            ).first()

            if not vendor_product:
                return None

            # Use the related product to fetch the latest price
            latest_price = price_table.objects.filter(
                product=vendor_product
            ).order_by('-current_time').first()

            return latest_price.price if latest_price else None
        except Exception:
            return None

    def get_tax(self, obj):
        try:
            vendor_product = VendorMaster.objects.filter(
                vendor=obj.vendor,
                component_id=obj.component
            ).first()

            if not vendor_product:
                return None

            latest_price = price_table.objects.filter(
                product=vendor_product
            ).order_by('-current_time').first()

            return latest_price.tax if latest_price else None
        except Exception:
            return None
