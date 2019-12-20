import React, { memo, useState, useCallback, Fragment, useEffect } from "react";
import { Button, Fade, Grid } from "@material-ui/core";
import { Modal, TooltipIcon } from "../";
import { handlePromise, useToggle, baseRequest, handleFile } from "../../utils";
import { defaultCrop, handleMaxSize } from "./utils";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import "./style.css";

const _Crop = ({ onPicture, src }) => {
	const [file, setFile] = useState({}),
		onClose = useCallback(_ => setFile({}), []),
		[crop, setCrop] = useState(defaultCrop),
		handleCropChange = useCallback(a => setCrop(a), []), //To use only the first argument
		{ toggle, toggled } = useToggle(),
		handleFileSize = useCallback(
			e =>
				handleFile(e).then(({ name, file }) => {
					const image = new Image();
					image.onload = _ => {
						const isLarge = image.height < image.width;
						let width, height, scaleX, scaleY;
						if (isLarge) {
							width = handleMaxSize(image.width);
							scaleX = image.width / width;
							height = image.height / scaleX;
							scaleY = image.height / height;
						} else {
							height = handleMaxSize(image.height);
							scaleY = image.height / height;
							width = image.width / scaleY;
							scaleX = image.width / width;
						}
						const canvas = document.createElement("canvas"),
							ctx = canvas.getContext("2d"),
							_canvas = document.createElement("canvas"),
							_ctx = canvas.getContext("2d");
						canvas.width = width;
						canvas.height = height;
						_canvas.width = width;
						_canvas.height = height;
						_ctx.drawImage(image, 0, 0, _canvas.width, _canvas.height);
						_ctx.drawImage(_canvas, 0, 0, _canvas.width * scaleX, _canvas.height * scaleY);
						ctx.drawImage(
							_canvas,
							0,
							0,
							_canvas.width * scaleX,
							_canvas.height * scaleY,
							0,
							0,
							canvas.width,
							canvas.height
						);

						setFile({ name, file: canvas.toDataURL("image/jpeg") });
					};
					image.src = file;
				}),
			[]
		),
		handleRotation = useCallback(
			({
				currentTarget: {
					dataset: { orientation }
				}
			}) => {
				const contentImage = document.querySelector(".ReactCrop__image"),
					{ width, height } = contentImage,
					canvas = document.createElement("canvas"),
					ctx = canvas.getContext("2d"),
					image = new Image();
				image.src = file.file;
				canvas.width = height;
				canvas.height = width;
				ctx.translate(canvas.width / 2, canvas.height / 2);
				ctx.rotate(0.5 * (orientation === "left" ? -1 : 1) * Math.PI);
				ctx.drawImage(image, -width / 2, -height / 2);
				setFile(file => ({ ...file, file: canvas.toDataURL("image/jpeg") }));
			},
			[file]
		),
		handlePicture = useCallback(
			_ => {
				const contentImage = document.querySelector(".ReactCrop__image"),
					{ naturalWidth, naturalHeight } = contentImage,
					scaleX = naturalWidth / contentImage.width,
					scaleY = naturalHeight / contentImage.height,
					{ x, y, width, height } = crop,
					image = new Image(),
					canvas = document.createElement("canvas"),
					ctx = canvas.getContext("2d");
				canvas.width = width;
				canvas.height = height;
				image.src = file.file;
				ctx.drawImage(
					image,
					x * scaleX,
					y * scaleY,
					width * scaleX,
					height * scaleY,
					0,
					0,
					width,
					height
				);
				handlePromise(
					baseRequest
						.post("upload_avatar", canvas.toDataURL("image/jpeg").split(",")[1])
						.then(({ data: { picture } = {} }) => onPicture(picture)),
					toggle
				).then(onClose);
			},
			[crop, onPicture, file, toggle, onClose]
		),
		inputFile = useCallback(
			_ => (
				<Button className="choose-picture" variant="contained" onDrop={handleFileSize}>
					Change profile picture
					<input type="file" onChange={handleFileSize} accept="image/png,image/jpeg,image/jpg" />
				</Button>
			),
			[handleFileSize]
		);

	useEffect(
		_ => {
			if (file) setCrop(defaultCrop);
		},
		[file]
	);

	return (
		<Fragment>
			<Grid item xs={12} sm={6}>
				<img alt="Profile" height="125" width="125" className="profile-image" {...{ src }} />
			</Grid>
			<Grid item xs={12} sm={6} className="align-center">
				{inputFile()}
			</Grid>
			<Modal
				maxWidth="md"
				open={!!file.file}
				TransitionComponent={Fade}
				title="Profile picture"
				actions={
					<Button disabled={toggled} type="submit" color="primary" onClick={handlePicture}>
						{toggled && <i className="fas fa-circle-notch fa-spin right" />} Confirm
					</Button>
				}
				{...{ onClose }}>
				<div className="text-center">Recommended size: 125x125</div>
				<div className="text-center">{`Current size: ${crop.width}x${crop.height}`}</div>
				<div className="align-center">
					<TooltipIcon
						title="Rotate left"
						onClick={handleRotation}
						data-orientation="left"
						children={<i className="material-icons">rotate_left</i>}
					/>
					<ReactCrop
						{...{ crop }}
						src={file.file}
						onChange={handleCropChange}
						minWidth={100}
						keepSelection
					/>
					<TooltipIcon
						title="Rotate right"
						onClick={handleRotation}
						data-orientation="right"
						children={<i className="material-icons">rotate_right</i>}
					/>
				</div>
				<div className="flex-center">{inputFile()}</div>
			</Modal>
		</Fragment>
	);
};

export const Crop = memo(_Crop);
