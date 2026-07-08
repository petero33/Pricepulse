class Product {
  final String id;
  final String name;
  final String? barcode;
  final String? imageUrl;
  final String? unit;
  final bool isVerified;
  final Category? category;
  final Brand? brand;
  final int viewCount;

  Product({
    required this.id,
    required this.name,
    this.barcode,
    this.imageUrl,
    this.unit,
    this.isVerified = false,
    this.category,
    this.brand,
    this.viewCount = 0,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      barcode: json['barcode'],
      imageUrl: json['imageUrl'],
      unit: json['unit'],
      isVerified: json['isVerified'] ?? false,
      category: json['category'] != null
          ? Category.fromJson(json['category'])
          : null,
      brand: json['brand'] != null ? Brand.fromJson(json['brand']) : null,
      viewCount: json['viewCount'] ?? 0,
    );
  }
}

class Category {
  final String id;
  final String name;
  final String slug;
  final String? iconUrl;
  final String? color;

  Category({
    required this.id,
    required this.name,
    required this.slug,
    this.iconUrl,
    this.color,
  });

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      slug: json['slug'] ?? '',
      iconUrl: json['iconUrl'],
      color: json['color'],
    );
  }
}

class Brand {
  final String id;
  final String name;
  final String slug;
  final String? logoUrl;

  Brand({required this.id, required this.name, required this.slug, this.logoUrl});

  factory Brand.fromJson(Map<String, dynamic> json) {
    return Brand(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      slug: json['slug'] ?? '',
      logoUrl: json['logoUrl'],
    );
  }
}
