import React, { memo } from "react";
import { A } from "hookrouter";
import { handleHome } from "../../utils";
import "./style.css";

const _Footer = _ => (
	<footer>
		<p>
			<a href="/blog" target="_blank">
				Blog
			</a>
			{" | "}
			<A href="/legal/terms-of-service">Terms of Service</A>
			{" | "}
			<A href="/legal/privacy-policy">Privacy Policy</A>
		</p>
		<p>
			&copy; Copyright 2019 <span onClick={handleHome}>Docduc Inc.</span>| 1875 Connecticut Ave. NW,
			Washington, DC 20009 | ☎ 202.851.2332 | 📧{" "}
			<a href="mailto:support@docduc.com">support@docduc.com</a>
		</p>
	</footer>
);

export const Footer = memo(_Footer);
