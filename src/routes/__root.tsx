import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},

			{
				name: "description",
				content:
					"Make a snow globe and send it to someone special this Christmas. ",
			},
			{
				title: "Snow Globe | Lemon Sour",
			},

			{
				name: "og:image",
				content: "https://globe.lemonsour.world/opengraph.jpg",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},

			{
				rel: "icon",
				href: "/favicon.png",
			},
		],
	}),

	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link
					rel="preconnect"
					href="https://fonts.gstatic.com"
					crossOrigin="anonymous"
				/>
				<link
					href="https://fonts.googleapis.com/css2?family=Inria+Serif:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&family=Kalnia&display=swap"
					rel="stylesheet"
				/>
			</head>
			<body>
				<div id="static-loader">
					<div className="inner">
						<div className="bar">
							<div className="bar-fill" />
						</div>
						<span className="text">Loading...</span>
					</div>
				</div>
				{children}
				{/*
				<TanStackDevtools
					config={{
						position: "bottom-right",
					}}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
					]}
				/>
        */}
				<Scripts />
			</body>
		</html>
	);
}
