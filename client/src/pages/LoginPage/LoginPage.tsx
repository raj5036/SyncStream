import { useState } from "react";
import "./LoginPage.css";
import GoogleIcon from "../../assets/svgs/GoogleIcon.svg";
import FacebookIcon from "../../assets/svgs/FacebookIcon.svg"

const LoginPage = () => {
	const [isRightActive, setIsRightActive] = useState(false);

	return (
		<>
			<h2>Some text</h2>
			<div
				className={`container ${isRightActive ? "right-panel-active" : ""}`}
				id="container"
			>
				<div className="form-container sign-up-container">
					<form action="#">
						<h1>Create Your SyncStream Account</h1>
						<div className="social-container">
							<img src={FacebookIcon} height={20} width={20} />
							<img src={GoogleIcon} height={20} width={20} />
						</div>
						<span>Join and stream videos together in real-time</span>
						<input type="text" placeholder="Name" />
						<input type="email" placeholder="Email" />
						<input type="password" placeholder="Password" />
						<button>Sign Up</button>
					</form>
				</div>

				<div className="form-container sign-in-container">
					<form action="#">
						<h1>Sign in</h1>
						<div className="social-container">
							<img src={FacebookIcon} height={20} width={20} />
							<img src={GoogleIcon} height={20} width={20} />
						</div>
						<span>Watch and sync videos with friends</span>
						<input type="email" placeholder="Email" />
						<input type="password" placeholder="Password" />
						<a href="#">Forgot your password?</a>
						<button>Sign In</button>
					</form>
				</div>

				<div className="overlay-container">
					<div className="overlay">
						<div className="overlay-panel overlay-left">
							<h1>Welcome Back!</h1>
							<p>Sign in to continue syncing videos with your friends and groups.</p>
							<button
								className="ghost"
								id="signIn"
								onClick={() => setIsRightActive(false)}
							>
								Sign In
							</button>
						</div>

						<div className="overlay-panel overlay-right">
							<h1>New to SyncStream?</h1>
							<p>Create an account and start enjoying synchronized video streaming.</p>
							<button
								className="ghost"
								id="signUp"
								onClick={() => setIsRightActive(true)}
							>
								Sign Up
							</button>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default LoginPage;
