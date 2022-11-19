const nodemailer = require("nodemailer");
const Nexmo = require("@vonage/server-sdk");
require("dotenv").config();

let transporter = nodemailer.createTransport({
	service: "SendPulse",
	auth: {
		user: process.env.SMTP_CLIENT_USERNAME,
		pass: process.env.SMTP_CLIENT_PASSWORD,
	},
});

function sendMailToClient(ride, user) {
	let email;
	if (user) {
		email = user.email;
	} else {
		email = ride.billingEmail;
	}

	let content = `
  <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
  <html lang="en" xmlns="http://wwww.w3.org/1999/xhtml">
    <head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>

    <body>
      <div>
        <table>
          <tr>
            <td style="background-color: #748aac;text-align: left;padding-left:16px;">
                <p style="font-size: 32px;" class="test">Details of Your Ride</p>
            </td>
          </tr>

          <tr>
            <td>
                <p style="text-align: left;font-size:26px;font-weight:bold;">General Information</p>
                <hr/>
            </td>
          </tr>

          <tr>
            <td>
              <table width="100%" style="border-spacing: 0;padding-bottom: 16px;">
                <tr>
                    <td style="font-size:20px;font-weight:color:#333;">Service Type</td>
                </tr>
                <tr>
                    <td style="color:#777">${ride.serviceType}</td>
                </tr>
              </table>

              <table width="100%" style="border-spacing: 0;padding-bottom: 16px;">
                <tr>
                    <td style="font-size:20px;font-weight:color:#333;">Pickup Date</td>
                </tr>
                <tr>
                    <td style="color:#777">${ride.pickupDate}</td>
                </tr>
              </table>

              <table width="100%" style="border-spacing: 0;padding-bottom: 16px;">
                <tr>
                    <td style="font-size:20px;font-weight:color:#333;">Pickup Time</td>
                </tr>
                <tr>
                    <td style="color:#777">${ride.pickupTime}</td>
                </tr>
              </table>

              <table width="100%" style="border-spacing: 0;padding-bottom: 16px;">
                <tr>
                    <td style="font-size:20px;font-weight:color:#333;">Total Amount</td>
                </tr>
                <tr>
                    <td style="color:#777">$${ride.price}</td>
                </tr>
              </table>

              <table width="100%" style="border-spacing: 0;padding-bottom: 16px;">
                <tr>
                  ${
										ride.hours !== "undefined"
											? `<td style="font-size:20px;font-weight:color:#333;">Number of Hours</td>`
											: ""
									}
                </tr>
                <tr>
                  ${
										ride.hours !== "undefined"
											? `<td style="color:#777">${ride.hours}</td>`
											: ""
									}
                </tr>
              </table>

              <table width="100%" style="border-spacing: 0;padding-bottom: 16px;">
                <tr>
                    <td style="font-size:20px;font-weight:color:#333;">Vehicle Type</td>
                </tr>
                <tr>
                    <td style="color:#777">${ride.vehicleType}</td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td>
              <p style="text-align: left;font-size:24px;font-weight:500;">
                Route Location
              </p>
              <hr>

              <table width="100%" style="border-spacing: 0;padding-bottom: 16px;">
                <tr>
                    <td style="font-size:20px;font-weight:color:#333;">Pickup Location</td>
                </tr>
                <tr>
                    <td style="color:#777">${ride.origin}</td>
                </tr>
              </table>

              <table width="100%" style="border-spacing: 0;padding-bottom: 16px;">
                  ${
										ride.destination !==
										"852 Lamington National Park Rd, Canungra QLD 4275, Australia"
											? `<tr>
												<td style="font-size:20px;font-weight:color:#333;">
													Dropoff Location
												</td>
											</tr>`
											: ""
									}
                
                ${
									ride.destination !==
									"852 Lamington National Park Rd, Canungra QLD 4275, Australia"
										? `<tr>
											<td style="color:#777">${ride.destination}</td>
										</tr>`
										: ""
								}
                
              </table>
            </td>
          </tr>

          <tr>
              <td>
                <p style="text-align: left;font-size:24px;font-weight:500;">
                  To cancel this booking, send a cancelation request to bookings@grandlane.com.au

                </p>
                
                <p style="text-align: left;font-size:24px;font-weight:500;">
                  The required information are:
                  1. Full name
                  2. Pickup Location
                </p>
              </td>
          </tr>
        </table>
      </div>
    </body>
  </html>
  `;

	transporter.sendMail(
		{
			from: "bookings@grandlane.com.au",
			to: email,
			subject: `Your Booking -- ${ride._id} has been Received`,
			html: content,
		},
		(err, data) => {
			if (err) {
				console.log(err);
				console.log(err.message);
				return { status: "failed" };
			} else {
				return { status: "success" };
			}
		}
	);
}

function sendMailToAdmin(ride, user) {
	let content = `
  <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
  <html lang="en" xmlns="http://wwww.w3.org/1999/xhtml">
    <head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>

    <body>
      <div>
        <table>
          <tr>
            <td style="background-color: #748aac;text-align: left;padding-left:16px;">
                <p style="font-size: 32px;" class="test">Pickup Details</p>
            </td>
          </tr>

          <tr>
            <td>
                <p style="text-align: left;font-size:26px;font-weight:bold;">General Information</p>
            </td>
          </tr>

          <tr>
            <td>
              <table width="100%" style="border-spacing: 0;padding-bottom: 16px;">
                <tr>
                    <td style="font-size:20px;font-weight:400;color:#333">Pickup Location</td>
                </tr>
                <tr>
                    <td style="color:#777;">${ride.origin}</td>
                </tr>
              </table>

              <table width="100%" style="border-spacing: 0;padding-bottom: 16px;">
              ${
								ride.destination !==
								"852 Lamington National Park Rd, Canungra QLD 4275, Australia"
									? `<tr>
                    <td style="font-size:20px;font-weight:color:#333;">
                      Dropoff Location
                    </td>
                  </tr>`
									: ""
							}
            
            ${
							ride.destination !==
							"852 Lamington National Park Rd, Canungra QLD 4275, Australia"
								? `<tr>
                  <td style="color:#777">${ride.destination}</td>
                </tr>`
								: ""
						}
              </table>

              <table width="100%" style="border-spacing: 0;padding-bottom: 16px;">
                <tr>
                    <td style="font-size:20px;font-weight:400;color:#333">Pickup Date & Time</td>
                </tr>
                <tr>
                    <td style="color:#777;">${ride.pickupDate} --- ${
		ride.pickupTime
	}</td>
                </tr>
              </table>

              <table width="100%" style="border-spacing: 0;padding-bottom: 16px;">
                <tr>
                    <td style="font-size:20px;font-weight:400;color:#333">Client Name</td>
                </tr>
                <tr>
                    <td style="color:#777;">${ride.billingName}</td>
                </tr>

                ${
									user
										? `<tr>
                <td style="color:#777;">${user.firstName} ${user.lastName}</td>
            </tr>`
										: ""
								}
              </table>

              <table width="100%" style="border-spacing: 0;padding-bottom: 16px;">
                <tr>
                    <td style="font-size:20px;font-weight:400;color:#333">Service Type</td>
                </tr>
                <tr>
                    <td style="color:#777;">${ride.serviceType}</td>
                </tr>
              </table>

              <table width="100%" style="border-spacing: 0;padding-bottom: 16px;">
                <tr>
                    <td style="font-size:20px;font-weight:color:#333;">Total Amount</td>
                </tr>
                <tr>
                    <td style="color:#777">$${ride.price}</td>
                </tr>
            </table>

              <table width="100%" style="border-spacing: 0;padding-bottom: 16px;">
                <tr>
                  ${
										ride.hours !== "undefined"
											? `<td style="font-size:20px;font-weight:400;color:#333">Number of Hours</td>`
											: ""
									}
                </tr>
                <tr>
                  ${
										ride.hours !== "undefined"
											? `<td style="color:#777;">${ride.hours}</td>`
											: ""
									}
                </tr>
              </table>

              <table width="100%" style="border-spacing: 0;padding-bottom: 16px;">
                <tr>
                    <td style="font-size:20px;font-weight:400;color:#333">Vehicle Type</td>
                </tr>
                <tr>
                    <td style="color:#777;">${ride.vehicleType}</td>
                </tr>
              </table>

              <table width="100%" style="border-spacing: 0;padding-bottom: 16px;">
                <tr>
                  ${
										ride.notes !== ""
											? `<td style="font-size:20px;font-weight:400;color:#333">Notes for the Driver</td>`
											: ""
									}
                </tr>
                <tr>
                  ${
										ride.notes !== ""
											? `<td style="color:#777;">${ride.notes}</td>`
											: ""
									}
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td>
            ${
							ride.serviceType === "Airport Transfer"
								? `<p style="text-align: left;font-size:24px;font-weight:500;">
            Client Details for Airport Transfer
          </p>`
								: ""
						}

              <table width="100%" style="border-spacing: 0;padding-bottom: 16px;">
                <tr>
                  ${
										ride.flightNumber !== ""
											? `<td style="font-size:20px;font-weight:400;color:#333">Flight Number</td>`
											: ""
									}
                </tr>
                <tr>
                  ${
										ride.flightNumber !== ""
											? `<td style="color:#777;">${ride.flightNumber}</td>`
											: ""
									}
                </tr>
              </table>

              <table width="100%" style="border-spacing: 0;padding-bottom: 16px;">
                <tr>
                  ${
										ride.pickupSign !== ""
											? `<td style="font-size:20px;font-weight:400;color:#333">Pickup Sign</td>`
											: ""
									}
                </tr>
                <tr>
                  ${
										ride.pickupSign !== ""
											? `<td style="color:#777;">${ride.pickupSign}</td>`
											: ""
									}
                </tr>
              </table>

              <table width="100%" style="border-spacing: 0;padding-bottom: 16px;">
                <tr>
                  ${
										ride.phoneNumber !== ""
											? `<td style="font-size:20px;font-weight:400;color:#333">Phone Number</td>`
											: ""
									}
                </tr>
                <tr>
                  ${
										ride.phoneNumber !== ""
											? `<td style="color:#777;">${ride.phoneNumber}</td>`
											: ""
									}
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
    </body>
  </html>
  `;

	transporter.sendMail(
		{
			from: "bookings@grandlane.com.au",
			to: "bookings@grandlane.com.au",
			subject: `RIDE REQUESTED`,
			html: content,
		},
		(err, data) => {
			if (err) {
				console.log(err);
				console.log(err.message);
				return { status: "failed" };
			} else {
				return { status: "success" };
			}
		}
	);
}

function forgotPasswordEmail(token, email, res, user) {
	let content = `
    <html>
      <div>
        <h1 style = "text-align: left; font-size: 3rem; color: #333; font-weight: 300; margin-bottom: 20px">Reset your Password</h1>
        <p style="color: #777; font-size: 18px">Hi ${user.firstName},</p>
        <p style="font-size: 18px; color: #777; margin-bottom: 32px;">Seems like you forgot your password. Reset your password by clicking the link below.</p>
        <a 
          href="https://grand-lane.netlify.app/reset-password/${token}" 
          target="_blank"
          style="font-size: 16px; text-decoration: none; background-color: #1752ab; color: #fff; padding-top: 6px; padding-bottom: 6px; padding-right: 10px; padding-left: 10px; margin-bottom: 32px;">
          Reset My Password
        </a>
        <p style="font-size: 18px; color: #777;">
          If you did not forget your password, you can safely ignore this mail.
        </p>
      </div>
    </html>
  `;

	transporter.sendMail(
		{
			from: "bookings@grandlane.com.au",
			to: email,
			subject: `Grandlane - Password Reset`,
			html: content,
		},
		(err, data) => {
			if (err) {
				console.log(err);
				return res.status(400).json({
					message:
						"Network error occured while sending the link; Please try again.",
					status: "failed",
				});
			} else {
				return res.status(200).json({
					message:
						"An e-mail with the reset link has been sent to you; Kindly follow the instructions.",
					status: "success",
				});
			}
		}
	);
}

function sendSmsMethod(user, ride) {
	const nexmo = new Nexmo({
		apiKey: process.env.NEXMO_API_KEY,
		apiSecret: process.env.NEXMO_API_SECRET,
	});

	const from = "OFFICE";
	const to = "+447466332115";
	const text = `
    New Ride Request.

    Pickup Address
    ${ride.origin}

    Destination
    ${ride.destination}

    Pickup Date
    ${ride.pickupDate}

    Pickup Time
    ${ride.pickupTime}

    Customer Name
    ${user.firstName} ${user.lastName}

    Service Type
    ${ride.serviceType}

    ${ride.hours !== "undefined" ? "Hours (For Hourly Service)" : ""}
    ${ride.hours !== "undefined" ? ride.hours : ""}

    Type of Vehicle
    ${ride.vehicleType}

    ${ride.notes !== "" ? "Customer Request" : ""}
    ${ride.notes !== "" ? ride.notes : ""}

    AIRPORT PICKUP DETAILS

    ${ride.flightNumber !== "" ? "Flight Number" : ""}
    ${ride.flightNumber !== "" ? ride.flightNumber : ""}

    ${ride.phoneNumber !== "" ? "Pickup Sign" : ""}
    ${ride.pickupSign !== "" ? ride.pickupSign : ""}

    ${ride.phoneNumber !== "" ? "Phone Number" : ""}
    ${ride.phoneNumber !== "" ? ride.phoneNumber : ""}
  `;

	nexmo.message.sendSms(
		from,
		to,
		text,
		{ type: "text" },
		(error, responseData) => {
			if (!error) {
				if (responseData.messages[0]["status"] === "0") {
					return;
				} else {
					console.log(
						`Message failed with error: ${responseData.messages[0]["error-text"]}`
					);
				}
			} else {
				return error;
			}
		}
	);
}

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

function sendSMSTwilio(user, ride) {
	const text = `
	  New Ride Request.

	  Pickup Address
	  ${ride.origin}

	  ${ride.hours === "undefined" ? "Destination" : ""}
    ${ride.hours === "undefined" ? `${ride.destination}` : ""}

	  Pickup Date and Time
	  ${ride.pickupDate} -- ${ride.pickupTime}

	  Customer Name
    ${user ? `${user.firstName} ${user.lastName}` : `${ride.billingName}`}

	  Service Type
	  ${ride.serviceType}
	  ${
			ride.hours !== "undefined"
				? `Hours (For Hourly Service): ${ride.hours}`
				: ""
		}

	  Type of Vehicle
	  ${ride.vehicleType}

	  ${ride.notes !== "" ? "Customer Request" : ""}
	  ${ride.notes !== "" ? ride.notes : ""}

    ${ride.serviceType === "Airport Transfer" ? "AIRPORT PICKUP DETAILS" : ""}

	  ${ride.flightNumber !== "" ? "Flight Number" : ""}
	  ${ride.flightNumber !== "" ? ride.flightNumber : ""}

	  ${ride.pickupSign !== "" ? "Pickup Sign" : ""}
	  ${ride.pickupSign !== "" ? ride.pickupSign : ""}

	  ${ride.phoneNumber !== "" ? "Phone Number" : ""}
	  ${ride.phoneNumber !== "" ? ride.phoneNumber : ""}
	`;
	client.messages
		.create({
			body: text,
			from: "+13204001902",
			to: "+61403008329",
		})
		.then(() => console.log("Successful"))
		.catch((err) => console.log(err));
}

module.exports = {
	sendMailToClient,
	sendMailToAdmin,
	forgotPasswordEmail,
	sendSmsMethod,
	sendSMSTwilio,
};
