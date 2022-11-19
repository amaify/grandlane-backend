const User = require("../models/user");
const { forgotPasswordEmail, sendSmsMethod } = require("../utils/mail");

const nodemailer = require("nodemailer");
const _ = require("lodash");
const distance = require("google-distance-matrix");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// let transporter = nodemailer.createTransport({
// 	host: "smtp.mailtrap.io",
// 	port: 465,
// 	ssl: false,
// 	tls: true,
// 	secure: false,
// 	auth: {
// 		user: process.env.MAIL_TRAP_USERNAME,
// 		pass: process.env.MAIL_TRAP_PASSWORD,
// 	},
// });

let transporter = nodemailer.createTransport({
	service: "SendPulse",
	auth: {
		user: process.env.SMTP_CLIENT_USERNAME,
		pass: process.env.SMTP_CLIENT_PASSWORD,
	},
});

exports.contactForm = (req, res, next) => {
	let { name, email, comment } = req.body;
	let content = `
  

  <html>
      <div>
        <h1 style = "text-align: left; font-size: 3rem; color: #333; font-weight: 300; margin-bottom: 20px">New Inquiry</h1>
        <p style="color: #777; font-size: 18px">${name.toUpperCase()}</p>
        <p style="font-size: 18px; color: #777; margin-bottom: 32px;">is contacting you for an information; Please find the information is below.</p>
		<h3 style="color: #333; font-size: 24px; font-weight: 400;">Email</h3>
		<p style="font-size: 18px; color: #777;">${email}</p>
		<h3 style="color: #333; font-size: 24px; font-weight: 400;">Message</h3>
        <p style="font-size: 18px; color: #777;">${comment}</p>
      </div>
    </html>
  `;

	transporter.sendMail(
		{
			from: "bookings@grandlane.com.au",
			to: "bookings@grandlane.com.au",
			subject: "NEW INQUIRY",
			html: content,
		},
		(err, data) => {
			if (err) {
				console.log(err);
				res.status(400).json({ status: "failed" });
			} else {
				res.status(201).json({ status: "success" });
			}
		}
	);
};

exports.distanceMatrix = async (req, res, next) => {
	let origin = [req.body.origin];
	let destination;

	let defaultDestination = [
		"852 Lamington National Park Rd, Canungra QLD 4275, Australia",
	];

	if (!req.body.destination) {
		destination = defaultDestination;
	} else {
		destination = [req.body.destination];
	}

	distance.key(process.env.GOOGLE_API_KEY);
	distance.mode("driving");

	distance.matrix(origin, destination, (error, distances) => {
		if (!error) {
			const totalDistance = distances.rows[0].elements[0].distance.value / 1000;
			//CALCULATING THE PRICE FOR EACH RIDES USING DISTANCE MATRIX
			const distanceValue = Math.floor(totalDistance * 100) / 100;

			//PRICE CALCULATION
			const sedanPrice = 4 * distanceValue;
			const vanPrice = 6 * distanceValue;
			const sedanHour = 85;
			const vanHour = 85;
			const setPrice = 100;

			const finalSedan = Math.floor(sedanPrice * 100) / 100;
			const finalVan = Math.floor(vanPrice * 100) / 100;
			res.status(201).json({
				distance: distances,
				sedan: finalSedan,
				van: finalVan,
				sedanHour: sedanHour,
				vanHour: vanHour,
				fixedPrice: setPrice,
				distValue: distanceValue,
			});
			// sendSmsMethod();
		} else {
			res.status(400).json({ error: error });
		}
	});
};

exports.forgotPassword = async (req, res, next) => {
	const email = req.body.email;

	const user = await User.findOne({ email });

	if (!user) {
		return res
			.status(404)
			.send({ error: "User does not exist!", statusCode: 404 });
	}

	const token = jwt.sign({ _id: user._id }, "secret", { expiresIn: "1h" });

	return user.updateOne({ resetLink: token }, (err, success) => {
		if (!err) {
			forgotPasswordEmail(token, email, res, user);
		} else {
			return res.status(400).json({ error: "Reset Password link error" });
		}
	});
};

exports.resetPassword = async (req, res, next) => {
	const { resetLink, newPassword } = req.body;

	if (!resetLink) {
		return res.status(401).json({ error: "Authentication Error!" });
	}

	jwt.verify(resetLink, "secret", (err, decodedData) => {
		if (err) {
			return res
				.status(401)
				.json({ error: "Incorrect Token or it is expired!" });
		}
	});

	let user = await User.findOne({ resetLink: resetLink });

	if (!user) {
		return res
			.status(404)
			.json({ error: "User with this token does not exist", statusCode: 404 });
	}

	const hashedPassword = await bcrypt.hash(newPassword, 12);

	const obj = {
		password: hashedPassword,
		resetLink: "",
	};

	user = _.extend(user, obj);
	user.save((err, result) => {
		if (!err) {
			return res.status(200).json({
				message:
					"Your have successfully changed your password; Kindly login to your account!",
				statusCode: 200,
			});
		}
		return res.status(401).json({
			error: "Reset Password Error; Please try again",
			statusCode: 401,
		});
	});
};
