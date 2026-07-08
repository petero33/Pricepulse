import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/colors.dart';
import '../../../core/theme/text_styles.dart';
import '../../../core/utils/helpers.dart';
import '../data/shopping_repository.dart';

class BasketScreen extends StatefulWidget {
  const BasketScreen({super.key});

  @override
  State<BasketScreen> createState() => _BasketScreenState();
}

class _BasketScreenState extends State<BasketScreen> {
  final _repo = ShoppingRepository();
  Map<String, dynamic>? _basket;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final basket = await _repo.getBasket();
      if (mounted) setState(() { _basket = basket; _loading = false; });
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _removeItem(String productId) async {
    await _repo.removeItem(productId);
    _load();
  }

  Future<void> _clearBasket() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Clear Basket'),
        content: const Text('Remove all items from your basket?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Clear', style: TextStyle(color: AppColors.error))),
        ],
      ),
    );
    if (confirmed == true) {
      await _repo.clearBasket();
      _load();
    }
  }

  @override
  Widget build(BuildContext context) {
    final items = (_basket?['items'] as List?) ?? [];

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Basket'),
        actions: [
          if (items.isNotEmpty)
            IconButton(
              icon: const Icon(Icons.delete_outline),
              onPressed: _clearBasket,
            ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : items.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.shopping_cart_outlined, size: 80, color: AppColors.textHint),
                      const SizedBox(height: 16),
                      Text('Your basket is empty', style: AppTextStyles.headlineSmall),
                      const SizedBox(height: 8),
                      Text('Search and add products to compare prices', style: AppTextStyles.bodyMedium),
                      const SizedBox(height: 24),
                      ElevatedButton(
                        onPressed: () => context.push('/search'),
                        child: const Text('Browse Products'),
                      ),
                    ],
                  ),
                )
              : Column(
                  children: [
                    Expanded(
                      child: ListView.builder(
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        itemCount: items.length,
                        itemBuilder: (context, index) {
                          final item = items[index] as Map<String, dynamic>;
                          final product = item['product'] as Map<String, dynamic>? ?? {};
                          return Card(
                            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                            child: ListTile(
                              leading: Container(
                                width: 48, height: 48,
                                decoration: BoxDecoration(
                                  color: AppColors.primary.withValues(alpha: 0.1),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Center(child: Text(product['name']?.toString().substring(0, 2).toUpperCase() ?? '?', style: TextStyle(fontWeight: FontWeight.w600, color: AppColors.primary))),
                              ),
                              title: Text(product['name'] ?? '', style: AppTextStyles.titleMedium, maxLines: 1, overflow: TextOverflow.ellipsis),
                              subtitle: Text('Qty: ${item['quantity']}', style: AppTextStyles.bodySmall),
                              trailing: IconButton(
                                icon: const Icon(Icons.remove_circle_outline, color: AppColors.error),
                                onPressed: () => _removeItem(item['productId']),
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, -2))],
                      ),
                      child: SafeArea(
                        child: SizedBox(
                          width: double.infinity,
                          child: ElevatedButton.icon(
                            onPressed: () => context.push('/basket/compare'),
                            icon: const Icon(Icons.compare_arrows),
                            label: Text('Compare Prices (${items.length} items)'),
                            style: ElevatedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(vertical: 16),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
    );
  }
}
