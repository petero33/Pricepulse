import '../../../core/network/api_client.dart';

class ShoppingRepository {
  final ApiClient _api = ApiClient();

  Future<Map<String, dynamic>> getBasket() async {
    final response = await _api.get('/shopping/basket');
    return response.data;
  }

  Future<void> addToBasket(String productId, {int quantity = 1}) async {
    await _api.post('/shopping/basket/add', data: {
      'productId': productId,
      'quantity': quantity,
    });
  }

  Future<void> updateQuantity(String productId, int quantity) async {
    await _api.patch('/shopping/basket/items/$productId', data: {
      'quantity': quantity,
    });
  }

  Future<void> removeItem(String productId) async {
    await _api.delete('/shopping/basket/items/$productId');
  }

  Future<void> clearBasket() async {
    await _api.delete('/shopping/basket/clear');
  }

  Future<List<dynamic>> comparePrices({
    double? lat,
    double? lng,
    double? maxDistanceKm,
  }) async {
    final response = await _api.get('/shopping/basket/compare', query: {
      if (lat != null) 'latitude': lat.toString(),
      if (lng != null) 'longitude': lng.toString(),
      if (maxDistanceKm != null) 'maxDistanceKm': maxDistanceKm.toString(),
    });
    return response.data as List<dynamic>;
  }
}
