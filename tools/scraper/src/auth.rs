use super::*;

use smol::Timer;
use thirtyfour::prelude::*;
use totp_rs::{Secret, TOTP};

const VSB_LOGIN_URL: &str = "https://vsb.mcgill.ca/login.jsp";
const MAX_ELEM_RETRIES: usize = 5;
pub const CHROMEDRIVER_PORT: usize = 9515;

pub async fn get_vsb_cookie(
  email: String,
  password: String,
  otp_secret: String,
) -> Result<String> {
  let mut caps = DesiredCapabilities::chrome();
  caps.set_headless()?;

  let driver =
    WebDriver::new(format!("http://localhost:{}", CHROMEDRIVER_PORT), caps)
      .await?;

  // Need to use new_unchecked because Microsoft auth secret length
  // is too short lol
  let totp = TOTP::new_unchecked(
    totp_rs::Algorithm::SHA1,
    6,
    1,
    30,
    Secret::Encoded(otp_secret.to_uppercase()).to_bytes()?,
  );

  driver.goto(VSB_LOGIN_URL).await?;

  info!("Entering email...");
  let email_field = retry_til_visible(&driver, By::Name("loginfmt")).await?;
  email_field.send_keys(email).await?;
  email_field.send_keys(Key::Return).await?;
  Timer::after(Duration::from_secs(1)).await;

  info!("Entering password...");
  let password_field = retry_til_visible(&driver, By::Name("passwd")).await?;
  password_field.send_keys(password).await?;
  Timer::after(Duration::from_secs(1)).await;

  info!("Signing in...");
  let submit_button = retry_til_visible(&driver, By::Id("idSIButton9")).await?;
  submit_button.click().await?;
  Timer::after(Duration::from_secs(1)).await;

  info!("Entering OTP...");
  let otp_field = retry_til_visible(&driver, By::Name("otc")).await?;
  otp_field.send_keys(totp.generate_current()?).await?;
  otp_field.send_keys(Key::Return).await?;
  Timer::after(Duration::from_secs(3)).await;

  info!("Finishing up...");
  let no_button = retry_til_visible(&driver, By::Id("idBtn_Back")).await?;
  no_button.click().await?;
  Timer::after(Duration::from_secs(1)).await;

  let cookies = driver.get_all_cookies().await?;

  driver.quit().await?;
  Ok(format_cookie(cookies))
}

async fn retry_til_visible(driver: &WebDriver, by: By) -> Result<WebElement> {
  let mut retries = 0;
  let mut elem = driver.find(by.clone()).await;
  while elem.is_err() {
    if retries > MAX_ELEM_RETRIES {
      break;
    }
    Timer::after(Duration::from_secs(1)).await;
    retries += 1;
    elem = driver.find(by.clone()).await;
  }
  Ok(elem?)
}

fn format_cookie(cookies: Vec<Cookie>) -> String {
  let cookies: Vec<String> = cookies
    .into_iter()
    .map(|c| format!("{}={}", c.name, c.value))
    .collect();
  cookies.join("; ")
}
