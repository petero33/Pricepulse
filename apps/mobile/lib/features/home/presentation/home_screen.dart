import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/colors.dart';
import '../../../core/theme/text_styles.dart';
import '../../products/data/product_repository.dart';
import '../../products/domain/product_model.dart';
import '../../shopping/data/shopping_repository.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _searchController = TextEditingController();
  final _productRepo = ProductRepository();
  final _shoppingRepo = ShoppingRepository();
  List<Category> _categories = [];
  Map<String, dynamic>? _basket;
  int _basketItemCount = 0;
  int _selectedIndex = 0;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final categories = await _productRepo.getCategories();
      final basket = await _shoppingRepo.getBasket();
      if (mounted) {
        setState(() {
          _categories = categories;
          _basket = basket;
          final items = basket['items'] as List? ?? [];
          _basketItemCount = items.fold<int>(0, (sum, item) => sum + (item['quantity'] as int? ?? 0));
        });
      }
    } catch (_) {}
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('PricePulse'),
        actions: [
          Stack(
            children: [
              IconButton(
                icon: const Icon(Icons.shopping_cart_outlined),
                onPressed: () => context.push('/basket'),
              ),
              if (_basketItemCount > 0)
                Positioned(
                  right: 6,
                  top: 6,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(color: AppColors.accent, shape: BoxShape.circle),
                    child: Text('$_basketItemCount', style: const TextStyle(fontSize: 10, color: Colors.white, fontWeight: FontWeight.w600)),
                  ),
                ),
            ],
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadData,
        child: CustomScrollView(
          slivers: [
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
                child: GestureDetector(
                  onTap: () => context.push('/search'),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.divider),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.search, color: AppColors.textHint),
                        const SizedBox(width: 12),
                        Text('Search products...', style: AppTextStyles.bodyMedium),
                      ],
                    ),
                  ),
                ),
              ),
            ),
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                child: Text('Categories', style: AppTextStyles.headlineSmall),
              ),
            ),
            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              sliver: SliverGrid(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 4,
                  mainAxisSpacing: 12,
                  crossAxisSpacing: 12,
                  childAspectRatio: 0.85,
                ),
                delegate: SliverChildBuilderDelegate(
                  (context, index) {
                    final cat = _categories[index];
                    return _CategoryTile(category: cat);
                  },
                  childCount: _categories.length,
                ),
              ),
            ),
            const SliverToBoxAdapter(child: SizedBox(height: 16)),
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('My Basket', style: AppTextStyles.headlineSmall),
                    TextButton(
                      onPressed: () => context.push('/basket'),
                      child: const Text('View All'),
                    ),
                  ],
                ),
              ),
            ),
            if (_basket != null && (_basket!['items'] as List?)?.isNotEmpty == true)
              SliverToBoxAdapter(
                child: _buildBasketSummary(),
              )
            else
              SliverToBoxAdapter(
                child: Card(
                  margin: const EdgeInsets.symmetric(horizontal: 16),
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      children: [
                        Icon(Icons.shopping_cart_outlined, size: 48, color: AppColors.textHint),
                        const SizedBox(height: 8),
                        Text('Your basket is empty', style: AppTextStyles.bodyMedium),
                        const SizedBox(height: 4),
                        Text('Search products to add items', style: AppTextStyles.bodySmall),
                      ],
                    ),
                  ),
                ),
              ),
            const SliverToBoxAdapter(child: SizedBox(height: 80)),
          ],
        ),
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (i) {
          setState(() => _selectedIndex = i);
          if (i == 0) return;
          if (i == 1) context.push('/basket');
          if (i == 2) context.push('/search');
          if (i == 3) context.push('/profile');
        },
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.shopping_cart), label: 'Basket'),
          BottomNavigationBarItem(icon: Icon(Icons.search), label: 'Search'),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }

  Widget _buildBasketSummary() {
    final items = _basket!['items'] as List? ?? [];
    final totalItems = items.length;
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ...items.take(3).map((item) {
              final product = item['product'] as Map<String, dynamic>? ?? {};
              return ListTile(
                dense: true,
                leading: Container(
                  width: 40, height: 40,
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Center(child: Text(product['name']?.toString().substring(0, 2) ?? '?', style: const TextStyle(fontWeight: FontWeight.w600))),
                ),
                title: Text(product['name'] ?? '', style: AppTextStyles.titleMedium, maxLines: 1, overflow: TextOverflow.ellipsis),
                trailing: Text('x${item['quantity']}', style: AppTextStyles.bodyMedium),
              );
            }),
            const Divider(),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('$totalItems items', style: AppTextStyles.bodyMedium),
                ElevatedButton.icon(
                  onPressed: () => context.push('/basket/compare'),
                  icon: const Icon(Icons.compare_arrows, size: 18),
                  label: const Text('Compare Prices'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _CategoryTile extends StatelessWidget {
  final Category category;
  const _CategoryTile({required this.category});

  @override
  Widget build(BuildContext context) {
    final color = category.color != null
        ? Color(int.parse(category.color!.replaceFirst('#', '0xFF')))
        : AppColors.primaryLight;
    return GestureDetector(
      onTap: () => context.push('/search', extra: category.id),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 60, height: 60,
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Center(
              child: Text(
                category.name.substring(0, 2).toUpperCase(),
                style: TextStyle(fontWeight: FontWeight.w700, color: color, fontSize: 18),
              ),
            ),
          ),
          const SizedBox(height: 6),
          Text(category.name, textAlign: TextAlign.center, style: AppTextStyles.bodySmall, maxLines: 2, overflow: TextOverflow.ellipsis),
        ],
      ),
    );
  }
}

extension on BuildContext {
  void push(String location, [Object? extra]) {
    GoRouter.of(this).push(location, extra: extra);
  }
}
