import { makeStyles } from "@material-ui/core/styles";

export const useStylesTooltip = type =>
	makeStyles(theme => {
		const { black, white } = theme.palette.common,
			background = type === 0 ? black : white,
			color = type === 0 ? white : black;
		return {
			arrow: {
				position: "absolute",
				fontSize: 6,
				"&::before": {
					content: '""',
					margin: "auto",
					display: "block",
					width: 0,
					height: 0,
					borderStyle: "solid"
				}
			},
			popper: {
				'&[x-placement*="bottom"] $arrow': {
					top: 0,
					left: 0,
					marginTop: "-0.95em",
					width: "2em",
					height: "1em",
					"&::before": {
						borderWidth: "0 1em 1em 1em",
						borderColor: `transparent transparent ${background} transparent`
					}
				},
				'&[x-placement*="top"] $arrow': {
					bottom: 0,
					left: 0,
					marginBottom: "-0.95em",
					width: "2em",
					height: "1em",
					"&::before": {
						borderWidth: "1em 1em 0 1em",
						borderColor: `${background} transparent transparent transparent`
					}
				},
				'&[x-placement*="right"] $arrow': {
					left: 0,
					marginLeft: "-0.95em",
					height: "2em",
					width: "1em",
					"&::before": {
						borderWidth: "1em 1em 1em 0",
						borderColor: `transparent ${background} transparent transparent`
					}
				},
				'&[x-placement*="left"] $arrow': {
					right: 0,
					marginRight: "-0.95em",
					height: "2em",
					width: "1em",
					"&::before": {
						borderWidth: "1em 0 1em 1em",
						borderColor: `transparent transparent transparent ${background}`
					}
				}
			},
			tooltip: {
				position: "relative",
				backgroundColor: background,
				color,
				fontSize: "1em",
				fontWeight: "initial",
				fontFamily: "Montserrat",
				boxShadow: "0 1px 5px rgba(0, 0, 0, 0.1)"
			},
			tooltipPlacementLeft: { margin: "0 8px" },
			tooltipPlacementRight: { margin: "0 8px" },
			tooltipPlacementTop: { margin: "8px 0" },
			tooltipPlacementBottom: { margin: "8px 0" }
		};
	});

