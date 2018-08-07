<?php
/**
 * @package     ${NAMESPACE}
 * @subpackage
 *
 * @copyright   A copyright
 * @license     A "Slug" license name e.g. GPL2
 */

class ModSeoclickSliderHelper
{
	public static function crop($image, $mimeType, $imgWidth, $imgHeight, $newWidth, $newHeight)
	{
		$thumbnail_path = self::returnPathForResizedImages($image);

		if (file_exists($_SERVER['DOCUMENT_ROOT'] . '/' . $thumbnail_path))
		{
			$image_info = getimagesize($_SERVER['DOCUMENT_ROOT'] . '/' . $thumbnail_path);
			if ($image_info[0] == $newWidth && $image_info[1] == $newHeight) return $thumbnail_path;
		}

		if (!is_file($image) && !is_readable($image)) die(jText::sprintf("MOD_SEOCLICK_SLIDER_FILE_READ_ERROR", $image));

		if (isset($mimeType))
		{
			$mimeType = strtolower(
				array_pop(
					explode('/', $mimeType)
				)
			);
		}
		else
		{
			$mimeType = 'jpeg';
		}

		// Открываем изображение
		switch ($mimeType)
		{
			case 'jpg':
			case 'jpe':
			case 'jpeg':
				$image_original = imagecreatefromjpeg($image);
				break;
			case 'png':
				$image_original = imagecreatefrompng($image);
				break;
			case 'gif':
				$image_original = imagecreatefromgif($image);
				break;
			case 'wbmp':
				$image_original = imagecreatefromwbmp($image);
				break;
			default:
				return false;
		}

		// Создаем миниатюру
		$image_thumbnail = imagecreatetruecolor($newWidth, $newHeight);
		if ($mimeType == 'png')
		{
			// Сохраняем альфа-канал
			imagealphablending($image_thumbnail, false);
			imagesavealpha($image_thumbnail, true);
		}
		elseif ($mimeType == 'gif')
		{
			if (($transparent_index_original = imagecolortransparent($image_original)))
			{
				// Определяем прозрачный цвет и передаем его в миниатюру
				$transparent_color_original  = imagecolorsforindex($image_original, $transparent_index_original);
				$transparent_index_thumbnail = imagecolorallocate(
					$image_thumbnail,
					$transparent_color_original['red'],
					$transparent_color_original['green'],
					$transparent_color_original['blue']
				);
				imagecolortransparent($image_thumbnail, $transparent_index_thumbnail);
				imagefill($image_thumbnail, 0, 0, $transparent_index_thumbnail);
			}
		}
		// Вычисляем размер по ширине
		$x_original_new = (integer) ($newWidth * ($imgHeight / $newHeight));
		// Проверяем, не вышли ли за пределы изображения
		if ($x_original_new > $imgWidth)
		{
			// Вышли. Тогда вычисляем размер по высоте
			$y_original_new = (integer) ($imgHeight * ($imgWidth / $x_original_new));
			$x_original_new = $imgWidth;
		}
		else
		{
			$y_original_new = $imgHeight;
		}
		// Вычисляем срезы сторон
		$x_indent = $x_original_new - $imgWidth;
		$y_indent = $y_original_new - $imgHeight;
		// Вычисляем смещение
		$x_original_offset = ($x_indent !== 0) ? -(integer) ($x_indent / 2) : 0;
		$y_original_offset = ($y_indent !== 0) ? -(integer) ($y_indent / 2) : 0;

		// Копируем изображение в миниатюру
		imagecopyresampled($image_thumbnail, $image_original, 0, 0, $x_original_offset, $y_original_offset, $newWidth, $newHeight, $x_original_new, $y_original_new);

		// Сохраняем миниатюру
		switch ($mimeType)
		{
			case 'jpg':
			case 'jpe':
			case 'jpeg':
				imagejpeg($image_thumbnail, $thumbnail_path, 100);
				break;
			case 'png':
				imagepng($image_thumbnail, $thumbnail_path);
				break;
			case 'gif':
				imagegif($image_thumbnail, $thumbnail_path);
				break;
			case 'wbmp':
				imagewbmp($image_thumbnail, $thumbnail_path);
				break;
		}
		// Очищаем память
		imagedestroy($image_original);
		imagedestroy($image_thumbnail);

		return $thumbnail_path;
	}

	public static function resize($image, $mimeType, $imgWidth, $imgHeight, $newWidth, $newHeight, $ratio = true, $upsize = true)
	{
		$data              = array();
		$resize_image_path = self::returnPathForResizedImages($image);
		if (file_exists($_SERVER['DOCUMENT_ROOT'] . '/' . $resize_image_path))
		{
			$image_info = getimagesize($_SERVER['DOCUMENT_ROOT'] . '/' . $resize_image_path);
			if ($image_info[0] == $newWidth && $image_info[1] == $newHeight) return $resize_image_path;
		}

		// First, calculate the height.
		$height   = intval($newWidth / $imgWidth * $imgHeight);
		$newWidth = intval($height / $imgHeight * $imgWidth);

		// If we don't allow upsizing check if the new width or height are too big.
		if (!$upsize)
		{
			// If the given width is larger than the image width, then resize it
			if ($newWidth > $imgWidth)
			{
				$newWidth = $imgWidth;
				$height   = intval($newWidth / $imgWidth * $imgHeight);
			}

			// If the given height is larger then the image height, then resize it.
			if ($height > $imgHeight)
			{
				$height   = $imgHeight;
				$newWidth = intval($height / $imgHeight * $imgWidth);
			}
		}

		if ($ratio == true)
		{
			$source_aspect_ratio = $imgWidth / $imgHeight;
			$newHeight           = $newWidth / $source_aspect_ratio;
			/*$source_aspect_ratio = $imgWidth / $imgHeight;
			$thumbnail_aspect_ratio = $newWidth / $newHeight;
			if ($imgWidth <= $newWidth && $imgHeight <= $newHeight) {
				$newWidth = $imgWidth;
				$newHeight = $imgHeight;
			} elseif ($thumbnail_aspect_ratio > $source_aspect_ratio) {
				$newHeight = (int)($newWidth * $source_aspect_ratio);
			} else {
				$newHeight = (int)($newWidth / $source_aspect_ratio);
			}*/
		}

		$imgString = file_get_contents($_SERVER['DOCUMENT_ROOT'] . '/' . $image);

		$imageFromString = imagecreatefromstring($imgString);
		$tmp             = imagecreatetruecolor($newWidth, $newHeight);
		imagealphablending($tmp, false);
		imagesavealpha($tmp, true);
		imagecopyresampled(
			$tmp,
			$imageFromString,
			0,
			0,
			0,
			0,
			$newWidth,
			$newHeight,
			$imgWidth,
			$imgHeight
		);

		$data['newWidth']          = $newWidth;
		$data['newHeight']         = $newHeight;
		$data['resize_image_path'] = $resize_image_path;

		switch ($mimeType)
		{
			case "image/jpeg":
			case "image/jpg":
				imagejpeg($tmp, $_SERVER['DOCUMENT_ROOT'] . '/' . $resize_image_path, 90);
				break;
			case "image/png":
				imagepng($tmp, $_SERVER['DOCUMENT_ROOT'] . '/' . $resize_image_path, 0);
				break;
			case "image/gif":
				imagegif($tmp, $_SERVER['DOCUMENT_ROOT'] . '/' . $resize_image_path);
				break;
			default:
				throw new \Exception(" Only jpg, jpeg, png and gif files can be resized ");
				break;
		}

		return $data;
	}

	private static function returnPathForResizedImages($path)
	{

		$resized_image_path = explode('/', $path);
		$filename           = array_pop($resized_image_path);
		array_push($resized_image_path, 'resized');
		$resized_image_path = implode('/', $resized_image_path);

		if (!file_exists($resized_image_path))
		{
			mkdir($resized_image_path);
		}

		$resized_image_path .= '/' . $filename;

		return $resized_image_path;
	}
}