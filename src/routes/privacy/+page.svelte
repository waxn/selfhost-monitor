<script lang="ts">
	import { goto } from '$app/navigation';
</script>

<div class="legal-page">
	<div class="legal-header">
		<button class="back-btn" onclick={() => goto('/')}>
			<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
				<path
					d="M12.5 15L7.5 10L12.5 5"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
			Back to Home
		</button>
		<h1>Privacy Policy</h1>
		<p class="last-updated">Last Updated: October 18, 2025</p>
	</div>

	<div class="legal-content">
		<section>
			<h2>1. Introduction</h2>
			<p>
				SelfHost Monitor ("we," "our," or "us") is committed to protecting your privacy. This
				Privacy Policy explains how we collect, use, disclose, and safeguard your information when
				you use our service monitoring platform.
			</p>
			<p>
				By using SelfHost Monitor, you agree to the collection and use of information in accordance
				with this policy. If you do not agree with our policies and practices, please do not use
				our Service.
			</p>
		</section>

		<section>
			<h2>2. Information We Collect</h2>

			<h3>2.1 Account Information</h3>
			<p>When you create an account, we collect:</p>
			<ul>
				<li>Email address</li>
				<li>Name (optional)</li>
				<li>Password (stored as a cryptographic hash)</li>
				<li>Account creation date</li>
			</ul>

			<h3>2.2 Service Monitoring Data</h3>
			<p>When you use our monitoring features, we collect:</p>
			<ul>
				<li>Device names and descriptions</li>
				<li>Service names, notes, and custom icons</li>
				<li>Service URLs and endpoints you wish to monitor</li>
				<li>Monitoring configuration (ping intervals, labels, exclusions)</li>
				<li>Uptime check results (timestamps, response times, status codes, error messages)</li>
			</ul>

			<h3>2.3 Technical Information</h3>
			<p>We automatically collect certain technical information, including:</p>
			<ul>
				<li>Browser type and version</li>
				<li>Operating system</li>
				<li>IP address (for security and authentication purposes)</li>
				<li>Usage patterns and interaction with the Service</li>
			</ul>
		</section>

		<section>
			<h2>3. How We Use Your Information</h2>
			<p>We use the collected information for the following purposes:</p>
			<ul>
				<li>
					<strong>Service Provision:</strong> To provide, maintain, and improve the monitoring services
					you request
				</li>
				<li>
					<strong>Authentication:</strong> To verify your identity and manage your account
				</li>
				<li>
					<strong>Monitoring Operations:</strong> To perform uptime checks and monitor the services
					you configure
				</li>
				<li>
					<strong>Service Improvement:</strong> To analyze usage patterns and improve our Service
				</li>
				<li>
					<strong>Security:</strong> To detect, prevent, and address technical issues, fraud, or security
					breaches
				</li>
				<li>
					<strong>Communication:</strong> To send you technical notices, updates, and support messages
				</li>
			</ul>
		</section>

		<section>
			<h2>4. Data Storage and Security</h2>

			<h3>4.1 Data Storage</h3>
			<p>
				Your data is stored securely using Convex, a modern database platform with built-in
				security features. We implement appropriate technical and organizational measures to
				protect your data against unauthorized access, alteration, disclosure, or destruction.
			</p>

			<h3>4.2 Security Measures</h3>
			<ul>
				<li>Passwords are hashed using industry-standard cryptographic algorithms</li>
				<li>All data transmissions are encrypted using HTTPS/TLS</li>
				<li>Access to your data is restricted by user authentication</li>
				<li>Regular security updates and monitoring</li>
			</ul>

			<h3>4.3 Data Retention</h3>
			<p>
				We retain your information for as long as your account is active or as needed to provide
				you services. You may request deletion of your account and associated data at any time.
			</p>
		</section>

		<section>
			<h2>5. Data Sharing and Disclosure</h2>
			<p>We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:</p>

			<h3>5.1 Service Providers</h3>
			<p>
				We may share your information with third-party service providers who assist us in operating
				our Service, such as:
			</p>
			<ul>
				<li>Convex (database and backend infrastructure)</li>
				<li>Hosting providers</li>
			</ul>
			<p>
				These providers are contractually obligated to protect your data and use it only for the
				purposes we specify.
			</p>

			<h3>5.2 Legal Requirements</h3>
			<p>We may disclose your information if required to do so by law or in response to:</p>
			<ul>
				<li>Valid legal requests from government authorities</li>
				<li>Court orders or subpoenas</li>
				<li>Protection of our rights, property, or safety</li>
				<li>Investigation of potential violations of our Terms of Service</li>
			</ul>

			<h3>5.3 Business Transfers</h3>
			<p>
				If we are involved in a merger, acquisition, or sale of assets, your information may be
				transferred. We will provide notice before your information becomes subject to a different
				privacy policy.
			</p>
		</section>

		<section>
			<h2>6. Monitoring Third-Party Services</h2>
			<p>
				When you configure SelfHost Monitor to check the availability of your services, our
				servers will make HTTP/HTTPS requests to the URLs you specify. You are responsible for
				ensuring you have the right to monitor these services.
			</p>
			<p>
				<strong>Important:</strong> Only monitor services you own or have explicit permission to monitor.
				Monitoring services without authorization may violate laws or terms of service.
			</p>
		</section>

		<section>
			<h2>7. Your Rights and Choices</h2>

			<h3>7.1 Access and Update</h3>
			<p>
				You can access and update your account information at any time through the Service
				dashboard.
			</p>

			<h3>7.2 Data Deletion</h3>
			<p>
				You may request deletion of your account and all associated data. Upon deletion, all your
				devices, services, URLs, and monitoring history will be permanently removed.
			</p>

			<h3>7.3 Data Export</h3>
			<p>
				You have the right to request a copy of your data. Contact us to receive an export of your
				information in a structured, commonly used format.
			</p>

			<h3>7.4 Opt-Out</h3>
			<p>
				You may opt out of certain communications by adjusting your account settings or contacting
				us directly.
			</p>
		</section>

		<section>
			<h2>8. Cookies and Tracking</h2>
			<p>
				We use local storage and session management to maintain your login state and preferences.
				We do not use third-party advertising cookies or tracking scripts for marketing purposes.
			</p>
			<p>Essential cookies we use:</p>
			<ul>
				<li>Authentication tokens to keep you logged in</li>
				<li>Session data for Service functionality</li>
				<li>User preferences and settings</li>
			</ul>
		</section>

		<section>
			<h2>9. Children's Privacy</h2>
			<p>
				Our Service is not intended for individuals under the age of 13. We do not knowingly
				collect personal information from children under 13. If we become aware that we have
				collected personal information from a child under 13, we will take steps to delete such
				information.
			</p>
		</section>

		<section>
			<h2>10. International Data Transfers</h2>
			<p>
				Your information may be transferred to and processed in countries other than your country
				of residence. These countries may have different data protection laws. By using our
				Service, you consent to the transfer of your information to these countries.
			</p>
		</section>

		<section>
			<h2>11. Changes to This Privacy Policy</h2>
			<p>
				We may update our Privacy Policy from time to time. We will notify you of any changes by
				posting the new Privacy Policy on this page and updating the "Last Updated" date.
			</p>
			<p>
				You are advised to review this Privacy Policy periodically for any changes. Changes to this
				Privacy Policy are effective when they are posted on this page.
			</p>
		</section>

		<section>
			<h2>12. Contact Us</h2>
			<p>
				If you have any questions about this Privacy Policy, your data, or our privacy practices,
				please contact us through the application or at the contact information provided on our
				website.
			</p>
			<p>We will respond to your inquiries within a reasonable timeframe.</p>
		</section>

		<section>
			<h2>13. Data Protection Rights (GDPR)</h2>
			<p>If you are a resident of the European Economic Area (EEA), you have certain data protection rights:</p>
			<ul>
				<li><strong>Right to Access:</strong> You can request copies of your personal data</li>
				<li><strong>Right to Rectification:</strong> You can request correction of inaccurate data</li>
				<li><strong>Right to Erasure:</strong> You can request deletion of your data</li>
				<li><strong>Right to Restrict Processing:</strong> You can request that we limit how we use your data</li>
				<li><strong>Right to Data Portability:</strong> You can request transfer of your data</li>
				<li><strong>Right to Object:</strong> You can object to our processing of your data</li>
			</ul>
			<p>To exercise these rights, please contact us using the information provided above.</p>
		</section>
	</div>
</div>

<style>
	.legal-page {
		min-height: 100vh;
		background: #0a0e12;
		color: #e8eaed;
		padding: 40px 20px;
	}

	.legal-header {
		max-width: 900px;
		margin: 0 auto 40px;
	}

	.back-btn {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		background: transparent;
		border: 1px solid #3a3f47;
		color: #a0a4a8;
		padding: 10px 20px;
		border-radius: 8px;
		font-size: 14px;
		cursor: pointer;
		transition: all 0.2s;
		margin-bottom: 32px;
	}

	.back-btn:hover {
		background: #2d3339;
		border-color: #d35400;
		color: #d35400;
	}

	h1 {
		font-size: 48px;
		font-weight: 800;
		margin: 0 0 12px 0;
		background: linear-gradient(135deg, #d35400 0%, #e67e22 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.last-updated {
		font-size: 14px;
		color: #6c757d;
		margin: 0;
	}

	.legal-content {
		max-width: 900px;
		margin: 0 auto;
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid #3a3f47;
		border-radius: 16px;
		padding: 48px;
	}

	section {
		margin-bottom: 48px;
	}

	section:last-child {
		margin-bottom: 0;
	}

	h2 {
		font-size: 28px;
		font-weight: 700;
		color: #e8eaed;
		margin: 0 0 16px 0;
	}

	h3 {
		font-size: 20px;
		font-weight: 600;
		color: #e8eaed;
		margin: 24px 0 12px 0;
	}

	p {
		font-size: 16px;
		line-height: 1.8;
		color: #a0a4a8;
		margin: 0 0 16px 0;
	}

	p:last-child {
		margin-bottom: 0;
	}

	ul {
		margin: 16px 0;
		padding-left: 24px;
	}

	li {
		font-size: 16px;
		line-height: 1.8;
		color: #a0a4a8;
		margin-bottom: 12px;
	}

	li:last-child {
		margin-bottom: 0;
	}

	strong {
		color: #d35400;
		font-weight: 600;
	}

	@media (max-width: 768px) {
		.legal-page {
			padding: 24px 16px;
		}

		h1 {
			font-size: 36px;
		}

		h2 {
			font-size: 24px;
		}

		h3 {
			font-size: 18px;
		}

		.legal-content {
			padding: 32px 24px;
		}

		p,
		li {
			font-size: 15px;
		}
	}
</style>
