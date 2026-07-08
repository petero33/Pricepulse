import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/colors.dart';
import '../../../core/theme/text_styles.dart';
import '../data/product_repository.dart';
import '../domain/product_model.dart';

class ProductDetailScreen extends ConsumerStatefulWidget {
  final String productId;
  const ProductDetailScreen({super.key, required this.productId});

  @override
  ConsumerState<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends ConsumerState<ProductDetailScreen> {
  final _repo = ProductRepository();
  Product? _product;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final product = await _repo.getProduct(widget.productId);
      if (mounted) setState(() { _product = product; _loading = false; });
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(_product?.name ?? 'Product Details')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _product == null
              ? const Center(child: Text('Product not found'))
              : ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    Center(
                      child: Container(
                        width: 120, height: 120,
                        decoration: BoxDecoration(
                          color: AppColors.primary.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(24),
                        ),
                        child: Center(
                          child: Text(
                            _product!.name.substring(0, 2).toUpperCase(),
                            style: const TextStyle(fontSize: 40, fontWeight: FontWeight.w700, color: AppColors.primary),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                    Text(_product!.name, style: AppTextStyles.headlineMedium, textAlign: TextAlign.center),
                    const SizedBox(height: 8),
                    if (_product!.brand != null || _product!.unit != null)
                      Text(
                        [_product!.brand?.name, _product!.unit].where((e) => e != null).join(' - '),
                        style: AppTextStyles.bodyMedium,
                        textAlign: TextAlign.center,
                      ),
                    const SizedBox(height: 24),
                    if (_product!.barcode != null)
                      _InfoRow(label: 'Barcode', value: _product!.barcode!),
                  ],
                ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final String label;
  final String value;
  const _InfoRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: AppTextStyles.bodyMedium),
          Text(value, style: AppTextStyles.titleMedium),
        ],
      ),
    );
  }
}
