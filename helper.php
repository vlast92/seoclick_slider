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
		$data = self::resize($image, $mimeType, $imgWidth, $imgHeight, $newWidth, $newHeight);
		if(!is_array($data)) return $data;

		$crop_image_path = $data['resize_image_path'];
		$imgWidth = $data['newWidth'];
		$imgHeight = $data['newHeight'];

		switch ($mimeType) {
			case "image/jpg":
			case "image/jpeg":
				$imageCreate = imagecreatefromjpeg( $_SERVER['DOCUMENT_ROOT'].'/'.$crop_image_path);
				break;

			case "image/png":
				$imageCreate = imagecreatefrompng( $_SERVER['DOCUMENT_ROOT'].'/'.$crop_image_path);
				break;

			case "image/gif":
				$imageCreate = imagecreatefromgif( $_SERVER['DOCUMENT_ROOT'].'/'.$crop_image_path);
				break;

			default:
				throw new \Exception(" Only gif, jpg, jpeg and png files can be cropped ");
				break;
		}

		// The image offsets/coordination to crop the image.
		$widthTrim = ceil(($imgWidth - $newWidth) / 2);
		$heightTrim = ceil(($imgHeight - $newHeight) / 2);

		if($widthTrim < 0 || $heightTrim < 0){
			$adding_size = max(abs($widthTrim), abs($heightTrim));
			$res_width = $imgWidth + $adding_size*2;
			$res_height = $imgHeight + $adding_size*2;

			$widthTrim = ceil(($res_width - $newWidth) / 2);
			$heightTrim = ceil(($res_height - $newHeight) / 2);

			$imgString = file_get_contents( $_SERVER['DOCUMENT_ROOT'].'/'.$crop_image_path);

			$imageFromString = imagecreatefromstring($imgString);
			$r_tmp = imagecreatetruecolor($res_width, $res_height);
			imagealphablending($r_tmp, false);
			imagesavealpha($r_tmp, true);
			imagecopyresampled(
				$r_tmp,
				$imageFromString,
				0,
				0,
				0,
				0,
				$res_width,
				$res_height,
				$imgWidth,
				$imgHeight
			);
			$imageCreate = $r_tmp;
		}
		// Can't crop to a bigger size, ex:
		// an image with 100X100 can not be cropped to 200X200. Image can only be cropped to smaller size.
		if ($widthTrim < 0 && $heightTrim < 0) {
			return;
		}

		$temp = imagecreatetruecolor($newWidth, $newHeight);
		imageAlphaBlending($temp, false);
		imageSaveAlpha($temp, true);
		imagecopyresampled(
			$temp,
			$imageCreate,
			0,
			0,
			$widthTrim,
			$heightTrim,
			$newWidth,
			$newHeight,
			$newWidth,
			$newHeight
		);


		if (!$temp) {
			throw new \Exception("Failed to crop image. Please pass the right parameters");
		}
		imagejpeg($temp,  $_SERVER['DOCUMENT_ROOT'].'/'.$crop_image_path);

		return $crop_image_path;
	}
	public static function resize($image, $mimeType, $imgWidth, $imgHeight, $newWidth, $newHeight, $ratio = true, $upsize = true)
	{
		$data = array();
		$resize_image_path = self::returnPathForResizedImages($image);
		if(file_exists($_SERVER['DOCUMENT_ROOT'].'/'.$resize_image_path)){
			$image_info = getimagesize($_SERVER['DOCUMENT_ROOT'].'/'.$resize_image_path);
			if($image_info[0] == $newWidth && $image_info[1] == $newHeight) return $resize_image_path;
		}

		// First, calculate the height.
		$height = intval($newWidth / $imgWidth * $imgHeight);
		$newWidth = intval($height / $imgHeight * $imgWidth);

		// If we don't allow upsizing check if the new width or height are too big.
		if (!$upsize) {
			// If the given width is larger than the image width, then resize it
			if ($newWidth > $imgWidth) {
				$newWidth = $imgWidth;
				$height = intval($newWidth / $imgWidth * $imgHeight);
			}

			// If the given height is larger then the image height, then resize it.
			if ($height > $imgHeight) {
				$height = $imgHeight;
				$newWidth = intval($height / $imgHeight * $imgWidth);
			}
		}

		if ($ratio == true) {
			$source_aspect_ratio = $imgWidth / $imgHeight;
			$newHeight = $newWidth / $source_aspect_ratio;
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

		$imgString = file_get_contents( $_SERVER['DOCUMENT_ROOT'].'/'.$image);

		$imageFromString = imagecreatefromstring($imgString);
		$tmp = imagecreatetruecolor($newWidth, $newHeight);
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

		$data['newWidth'] = $newWidth;
		$data['newHeight'] = $newHeight;
		$data['resize_image_path'] = $resize_image_path;

		switch ($mimeType) {
			case "image/jpeg":
			case "image/jpg":
				imagejpeg($tmp,  $_SERVER['DOCUMENT_ROOT'].'/'.$resize_image_path, 90);
				break;
			case "image/png":
				imagepng($tmp,  $_SERVER['DOCUMENT_ROOT'].'/'.$resize_image_path, 0);
				break;
			case "image/gif":
				imagegif($tmp,  $_SERVER['DOCUMENT_ROOT'].'/'.$resize_image_path);
				break;
			default:
				throw new \Exception(" Only jpg, jpeg, png and gif files can be resized ");
				break;
		}

		return $data;
	}
	private static function returnPathForResizedImages($path){

		$resized_image_path = explode('/', $path);
		$filename = array_pop($resized_image_path);
		array_push($resized_image_path, 'resized');
		$resized_image_path = implode('/', $resized_image_path);

		if(!file_exists($resized_image_path)){
			mkdir($resized_image_path);
		}

		$resized_image_path .='/'.$filename;

		return $resized_image_path;
	}
}