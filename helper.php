<?php
/**
 * @package    seoclick_slider
 *
 * @author     Vlast <vlasteg@mail.ru>
 * @copyright  A copyright
 * @license    GNU General Public License version 2 or later; see LICENSE.txt
 * @link       https://seoclick.by
 */

class ModSeoclickSliderHelper
{
	public static function crop($image, $mimeType, $imgWidth, $imgHeight, $newWidth, $newHeight)
	{
		$thumbnail_path = self::returnPathForResizedImages($image, $newWidth, $newHeight);

		if (file_exists(JPATH_BASE . '/' . $thumbnail_path))
		{
			if (!$image_info = getimagesize(JPATH_BASE . '/' . $thumbnail_path)) throw new \Exception("Error while reading image info;");
			if ($image_info[0] == $newWidth && $image_info[1] == $newHeight) return $thumbnail_path;
		}

		if (!is_file($image) && !is_readable($image)) throw new \Exception(jText::sprintf("MOD_SEOCLICK_SLIDER_FILE_READ_ERROR", $image));

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
				if (!$image_original = imagecreatefromjpeg($image)) throw new \Exception("Error while creating jpeg image;");
				break;
			case 'png':
				if (!$image_original = imagecreatefrompng($image)) throw new \Exception("Error while creating png image;");
				break;
			case 'gif':
				if (!$image_original = imagecreatefromgif($image)) throw new \Exception("Error while creating gif image;");
				break;
			case 'wbmp':
				if (!$image_original = imagecreatefromwbmp($image)) throw new \Exception("Error while creating wbmp image;");
				break;
			default:
				return false;
		}

		// Создаем миниатюру
		if (!$image_thumbnail = imagecreatetruecolor($newWidth, $newHeight)) throw new \Exception("Error while creating image;");
		if ($mimeType == 'png')
		{
			// Сохраняем альфа-канал
			if (!imagealphablending($image_thumbnail, false)) throw new \Exception("Error while setting blending mode;");
			if (!imagesavealpha($image_thumbnail, true)) throw new \Exception("Error while saving alpha channel");
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
				if (!imagefill($image_thumbnail, 0, 0, $transparent_index_thumbnail)) throw new \Exception("Error while filling image;");
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
		if (!imagecopyresampled($image_thumbnail, $image_original, 0, 0, $x_original_offset, $y_original_offset,
			$newWidth, $newHeight, $x_original_new, $y_original_new)) throw new \Exception("Error while copy resampled image;");

		// Сохраняем миниатюру
		switch ($mimeType)
		{
			case 'jpg':
			case 'jpe':
			case 'jpeg':
				if (!imagejpeg($image_thumbnail, $thumbnail_path, 100)) throw new \Exception("Error while saving image;");
				break;
			case 'png':
				if (!imagepng($image_thumbnail, $thumbnail_path)) throw new \Exception("Error while saving image;");
				break;
			case 'gif':
				if (!imagegif($image_thumbnail, $thumbnail_path)) throw new \Exception("Error while saving image;");
				break;
			case 'wbmp':
				if (!imagewbmp($image_thumbnail, $thumbnail_path)) throw new \Exception("Error while saving image;");
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
		$resize_image_path = self::returnPathForResizedImages($image, $newWidth, $newHeight);

		if (file_exists(JPATH_BASE . '/' . $resize_image_path))
		{
			if (!$image_info = getimagesize(JPATH_BASE . '/' . $resize_image_path)) throw new \Exception("Error while reading image info;");
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

		if (!$imgString = file_get_contents(JPATH_BASE . '/' . $image)) throw new \Exception("Error while reading image;");
		if (!$imageFromString = imagecreatefromstring($imgString)) throw new \Exception("Error while creating image from string;");
		if (!$tmp = imagecreatetruecolor($newWidth, $newHeight)) throw new \Exception("Error while creating image;");

		if (!imagealphablending($tmp, false)) throw new \Exception("Error while setting blending mode;");
		if (!imagesavealpha($tmp, true)) throw new \Exception("Error while saving alpha channel;");
		if (!imagecopyresampled(
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
		)) throw new \Exception("Error while copping resampled image;");

		$data['newWidth']          = $newWidth;
		$data['newHeight']         = $newHeight;
		$data['resize_image_path'] = $resize_image_path;

		switch ($mimeType)
		{
			case "image/jpeg":
			case "image/jpg":
				if (!imagejpeg($tmp, JPATH_BASE . '/' . $resize_image_path, 90)) throw new \Exception("Error while saving image;");
				break;
			case "image/png":
				if (!imagepng($tmp, JPATH_BASE . '/' . $resize_image_path, 0)) throw new \Exception("Error while saving image;");
				break;
			case "image/gif":
				if (!imagegif($tmp, JPATH_BASE . '/' . $resize_image_path)) throw new \Exception("Error while saving image;");
				break;
			default:
				throw new \Exception(" Only jpg, jpeg, png and gif files can be resized ");
				break;
		}

		return $data;
	}

	private static function returnPathForResizedImages($path, $width, $height)
	{

		$resized_image_path = explode('/', $path);
		$filename           = array_pop($resized_image_path);
		array_push($resized_image_path, 'resized/' . $width . 'x' . $height);
		$resized_image_path = implode('/', $resized_image_path);

		if (!file_exists($resized_image_path))
		{
			mkdir($resized_image_path);
		}

		$resized_image_path .= '/' . $filename;

		return $resized_image_path;
	}

	public static function addResponsiveImages($image, $image_info, $responsive_images_srcset, $resize_method)
	{

		$responsive_images = array();
		$orig_image_width  = $image['image_orig']['width'];
		$orig_image_height = $image['image_orig']['height'];

		foreach ($responsive_images_srcset as $key => $responsive_image_srcset)
		{
			$responsiveImageWidth = $responsive_image_srcset['srcset_image_width'];
			$responsiveImageHeight = round($responsiveImageWidth / $image_info['image_ratio']);

			switch ($resize_method)
			{
				case 'crop':
					$responsive_images[$key]['path'] = ModSeoclickSliderHelper::crop($image['image_orig']['path'], $image_info['mime'], $orig_image_width,
						$orig_image_height, $responsiveImageWidth, $responsiveImageHeight);
					break;
				case 'resize_ratio':
					$responsive_images[$key]['path'] = ModSeoclickSliderHelper::resize($image['image_orig']['path'], $image_info['mime'], $orig_image_width,
						$orig_image_height, $responsiveImageWidth, $responsiveImageHeight);
					if (is_array($responsive_images[$key]['srcset']['path'])) $responsive_images[$key]['srcset']['path'] = $responsive_images[$key]['srcset']['path']['resize_image_path'];
					break;
				case 'resize_no_ratio':
					$responsive_images[$key]['path'] = ModSeoclickSliderHelper::resize($image['image_orig']['path'], $image_info['mime'], $orig_image_width,
						$orig_image_height, $responsiveImageWidth, $responsiveImageHeight, false);
					if (is_array($responsive_images[$key]['srcset']['path'])) $responsive_images[$key]['srcset']['path'] = $responsive_images[$key]['srcset']['path']['resize_image_path'];
					break;
				default:
					$responsive_images[$key]['path'] = ModSeoclickSliderHelper::crop($image['image_orig']['path'], $image_info['mime'], $orig_image_width,
						$orig_image_height, $responsiveImageWidth, $responsiveImageHeight);
			}
			$responsive_images[$key]['path'] .= '?v=' . filemtime(JPATH_BASE . '/' . $responsive_images[$key]['srcset']['path']);
			$responsive_images[$key]['width'] = $responsiveImageWidth;
		}

		return $responsive_images;
	}
}