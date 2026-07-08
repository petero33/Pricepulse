import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/colors.dart';
import '../../../core/theme/text_styles.dart';
import '../../../core/utils/helpers.dart';
import '../../../shared/widgets/loading_shimmer.dart';
import '../../../shared/widgets/store_card.dart';
import '../data/shopping_repository.dart';

class ComparisonScreen extends StatefulWidget {
  const ComparisonScreen({super.key});

  @override
  State<ComparisonScreen> createState() => _ComparisonScreenState();
}

class _ComparisonScreenState extends State<ComparisonScreen> {
  final _repo = ShoppingRepository();
  List<dynamic> _results = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _compare();
  }

  Future<void> _compare() async {
    setState(() { _loading = true; _error = null; });
    try {
      final results = await _repo.comparePrices();
      if (mounted) setState(() { _results = results; _loading = false; });
    } catch (e) {
      if (mounted) setState(() { _error = e.toString(); _loading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Compare Prices'),
        actions: [
          IconButton(icon: const Icon(Icons.refresh), onPressed: _compare),
        ],
      ),
      body: _loading
          ? const LoadingShimmer()
          : _error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.error_outline, size: 64, color: AppColors.error),
                      const SizedBox(height: 16),
                      Text('Failed to compare prices', style: AppTextStyles.headlineSmall),
                      const SizedBox(height: 8),
                      Text(_error!, style: AppTextStyles.bodyMedium, textAlign: TextAlign.center),
                      const SizedBox(height: 24),
                      ElevatedButton(onPressed: _compare, child: const Text('Retry')),
                    ],
                  ),
                )
              : _results.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.store_mall_directory_outlined, size: 80, color: AppColors.textHint),
                          const SizedBox(height: 16),
                          Text('No stores found', style: AppTextStyles.headlineSmall),
                          const SizedBox(height: 8),
                          Text('Add items to your basket first', style: AppTextStyles.bodyMedium),
                          const SizedBox(height: 24),
                          ElevatedButton(onPressed: () => context.push('/basket'), child: const Text('Go to Basket')),
                        ],
                      ),
                    )
                  : Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(16),
                          color: AppColors.success.withValues(alpha: 0.08),
                          child: Column(
                            children: [
                              Text('Best Deal', style: AppTextStyles.headlineSmall),
                              const SizedBox(height: 4),
                              Text(
                                '${_results.first['storeName']} — ${formatPrice((_results.first['totalCost'] as num?)?.toDouble() ?? 0)}',
                                style: AppTextStyles.headlineMedium,
                              ),
                              if (_results.length > 1) ...[
                                const SizedBox(height: 4),
                                Text(
                                  'Save ${formatPrice(((_results.last['totalCost'] as num?)?.toDouble() ?? 0) - ((_results.first['totalCost'] as num?)?.toDouble() ?? 0))}',
                                  style: AppTextStyles.savings,
                                ),
                              ],
                            ],
                          ),
                        ),
                        const SizedBox(height: 8),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          child: Text(
                            '${_results.length} stores available',
                            style: AppTextStyles.titleMedium,
                          ),
                        ),
                        Expanded(
                          child: ListView.builder(
                            padding: const EdgeInsets.only(top: 8, bottom: 80),
                            itemCount: _results.length,
                            itemBuilder: (context, index) {
                              final r = _results[index] as Map<String, dynamic>;
                              return StoreResultCard(
                                storeName: r['storeName'] ?? '',
                                branchName: r['branchName'] ?? '',
                                storeColor: r['storeColor'],
                                totalCost: (r['totalCost'] as num?)?.toDouble(),
                                availableItems: r['availableItemsCount'] ?? 0,
                                totalItems: r['totalItemsCount'] ?? 0,
                                distance: (r['distance'] as num?)?.toDouble(),
                                isBest: index == 0,
                                onTap: () => _showDetails(r),
                              );
                            },
                          ),
                        ),
                      ],
                    ),
    );
  }

  void _showDetails(Map<String, dynamic> result) {
    final items = result['items'] as List<dynamic>? ?? [];
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        minChildSize: 0.4,
        maxChildSize: 0.9,
        expand: false,
        builder: (_, scrollController) => Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40, height: 4,
                  decoration: BoxDecoration(
                    color: AppColors.divider,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Text(result['storeName'] ?? '', style: AppTextStyles.headlineSmall),
              Text(result['branchName'] ?? '', style: AppTextStyles.bodyMedium),
              const Divider(),
              Text('Item Breakdown', style: AppTextStyles.titleLarge),
              const SizedBox(height: 8),
              Expanded(
                child: ListView.separated(
                  controller: scrollController,
                  itemCount: items.length,
                  separatorBuilder: (_, __) => const Divider(),
                  itemBuilder: (_, i) {
                    final item = items[i] as Map<String, dynamic>;
                    return ListTile(
                      dense: true,
                      title: Text(item['name'] ?? '', style: AppTextStyles.titleMedium, maxLines: 1, overflow: TextOverflow.ellipsis),
                      subtitle: Text('Qty: ${item['quantity']} × ${item['unitPrice'] != null ? formatPrice((item['unitPrice'] as num).toDouble()) : 'N/A'}', style: AppTextStyles.bodySmall),
                      trailing: item['available'] == true
                          ? Text(formatPrice((item['totalPrice'] as num).toDouble()), style: AppTextStyles.priceSmall)
                          : const Icon(Icons.close, color: AppColors.error, size: 20),
                    );
                  },
                ),
              ),
              const Divider(thickness: 2),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Total (${result['availableItemsCount']}/${result['totalItemsCount']} items)', style: AppTextStyles.titleLarge),
                  Text(result['totalCost'] != null ? formatPrice((result['totalCost'] as num).toDouble()) : 'N/A', style: AppTextStyles.price),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
