import '../../../core/network/api_client.dart';
import '../domain/product_model.dart';

class ProductRepository {
  final ApiClient _api = ApiClient();

  Future<List<Product>> searchProducts(String query) async {
    final response = await _api.get('/search', query: {'q': query});
    final list = response.data as List;
    return list.map((json) => Product.fromJson(json)).toList();
  }

  Future<Product> getProduct(String id) async {
    final response = await _api.get('/products/$id');
    return Product.fromJson(response.data);
  }

  Future<Map<String, dynamic>> getProducts({
    String? categoryId,
    String? brandId,
    String? search,
    int page = 1,
    int limit = 20,
  }) async {
    final response = await _api.get('/products', query: {
      if (categoryId != null) 'categoryId': categoryId,
      if (brandId != null) 'brandId': brandId,
      if (search != null) 'search': search,
      'page': page.toString(),
      'limit': limit.toString(),
    });
    return response.data;
  }

  Future<List<Category>> getCategories() async {
    final response = await _api.get('/products/categories');
    final list = response.data as List;
    return list.map((json) => Category.fromJson(json)).toList();
  }
}
