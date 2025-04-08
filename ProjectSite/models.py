from django.db import models

class Hotel(models.Model):
    name = models.CharField(max_length=255, verbose_name="Название отеля")
    location = models.CharField(max_length=255, verbose_name="Местоположение")
    price_per_night = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Цена за ночь")
    rating = models.FloatField(verbose_name="Рейтинг")
    guests_capacity = models.IntegerField(verbose_name="Максимальное количество гостей")
    available_from = models.DateField(verbose_name="Доступен с")
    available_to = models.DateField(verbose_name="Доступен до")
    image_url = models.URLField(default="https://source.unsplash.com/800x600/?hotel", verbose_name="Изображение")

    def __str__(self):
        return f"{self.name} ({self.location})"
