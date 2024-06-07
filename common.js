var Shopjar = Shopjar || {};
var paramValue = new URL(window.location.href).searchParams.get("cf_ref");
var affiliateParamValue = new URL(window.location.href).searchParams.get("sjram");
Shopjar.cookieDelete =
  Shopjar.cookieDelete ||
  ((name) => {
    document.cookie =
      name + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
  });
Shopjar.cookieGet =
  Shopjar.cookieGet ||
  ((name) => {
    let cookieArr = document.cookie.split(";");
    for (let i = 0; i < cookieArr.length; i++) {
      let cookiePair = cookieArr[i].split("=");
      if (name == cookiePair[0].trim()) {
        return decodeURIComponent(cookiePair[1]);
      }
    }
    return null;
  });
 Shopjar.cookieSet=Shopjar.cookieSet ||((name, value, days)=>{
  let expires = "";
  if (days) {
    let date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date;
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
 })

Shopjar.updateCartAttr =
  Shopjar.updateCartAttr ||
  ((key, token) => {
    if (token != null && token != "null") {
      const attributes = {};
      //cf_ram_reference
      attributes[key] = token;
      navigator.sendBeacon(
        "/cart/update.json",
        new Blob([JSON.stringify({ attributes: attributes })], {
          type: "application/json",
        })
      );
    }
    //cFRAMDeleteCookie("cf_ram_user_key");
  });
Shopjar.loadScriptByURL = function (id, url, callback) {
  const isScriptExist = document.getElementById(id);
  if (!isScriptExist) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = url;
    script.id = id;
    script.onload = function () {
      if (callback) callback();
    };
    document.body.appendChild(script);
  }
  if (isScriptExist && callback) callback();
};
Shopjar.referral_reward_claim_popup_init = function () {
  console.log("referral_reward_claim_popup_init")
  // const paramValue = new URL(window.location.href).searchParams.get("cf_ref");
  // Landing Page
  if (
    paramValue &&
    (Shopjar.cookieGet("cf_ram_m")||sessionStorage.getItem("cf_ram_m"))&&
    Shopjar.settings.is_referral_enabled &&
    paramValue === "referral"&&Shopjar?.reward_claim_popup_data?.status==="ACTIVE"
  ) {
    document.querySelector("#sj_rcp_body").style.display = "flex";
    const landingPageContainer = document.querySelector(
      "#sj_rcp_body  .cf_ram_landing_page_container"
    );
    const landingPopupFlexContainer = document.querySelector(
      "#sj_rcp_body  .cf_ram_landing_page_flex_container"
    );
    if (landingPageContainer) {
      const landingPageBody = document.querySelector("#sj_rcp_body");
      const landingPageFormContainer = document.querySelector(
        "#sj_rcp_body .cf_ram_landing_page_form_container"
      );
      const landingPagePopupCloseButton = document.querySelector(
        "#sj_rcp_body .cf_ram_close_button"
      );
      const landingPagePopupBackground = document.querySelector(
        "#sj_rcp_body .cf_ram_landing_popup_background"
      );
      const title1 = document.querySelector(
        "#sj_rcp_body .cf_ram_pop_up_title_one"
      );
      const title2 = document.querySelector(
        "#sj_rcp_body .cf_ram_pop_up_title_two"
      );
      const subTitle1 = document.querySelector(
        "#sj_rcp_body .cf_ram_pop_up_subtitle_one"
      );
      const subTitle2 = document.querySelector(
        "#sj_rcp_body .cf_ram_pop_up_subtitle_two"
      );
      const landingPageForm = document.querySelector(
        "#sj_rcp_body .cf_ram_landing_page_form"
      );
      const emailInput = document.querySelector(
        "#sj_rcp_body .cf_ram_email_input"
      );
      const discountCode = document.querySelector(
        "#sj_rcp_body .cf_ram_discount_code"
      );
      const getCouponButton = document.querySelector(
        "#sj_rcp_body .cf_ram_submit_button"
      );
      const landingCopyIcon = document.querySelector(
        "#sj_rcp_body .cf_ram_landing_copy_icon"
      );
      const landingCheckIcon = document.querySelector(
        "#sj_rcp_body .cf_ram_landing_check_icon"
      );
      const copyPrompt = document.querySelector(
        "#sj_rcp_body .cf_ref_copy_code_prompt"
      );
      const couponContainer = document.querySelector(
        "#sj_rcp_body .cf_ram_model_data"
      );
      const landingFormError = document.querySelector(
        "#sj_rcp_body .cf_ram_landing_page_form_error"
      );
      if (landingCopyIcon) {
        landingCopyIcon.onclick = () => {
          navigator.clipboard.writeText(discountCode.innerHTML);
          landingCopyIcon.style.display = "none";
          landingCheckIcon.style.display = "block";
          setTimeout(() => {
            landingCheckIcon.style.display = "none";
            landingCopyIcon.style.display = "block";
          }, 3000);
        };
      }
      if (
        landingPagePopupCloseButton &&
        landingPagePopupBackground &&
        landingPageBody
      ) {
        landingPagePopupCloseButton.onclick = () => {
          landingPageContainer.style.display = "none";
          landingPagePopupBackground.style.display = "none";
          landingPageBody.style.display = "none";
        };
      }
      async function requestCoupon(data) {
        const response = await fetch(
          Shopjar.settings.proxy_url + "/referral/coupon",
          {
            method: "POST",
            body: JSON.stringify(data),
          }
        );
        let responseData = await response.json();
        if (responseData.status && responseData.data.coupon) {
          Shopjar.cookieSet(
            "cf_ram_coupon",
            responseData.data.coupon,
            Number(Shopjar.settings.cookie_validity)
          );
          sessionStorage.setItem('cf_ram_coupon', responseData.data.coupon);
          Shopjar.cookieSet(
            "cf_ram_token",
            responseData.data.token,
            Number(Shopjar.settings.cookie_validity)
          );
          sessionStorage.setItem("cf_ram_token", responseData.data.token);
          Shopjar.updateCartAttr(responseData.data.token);
          if (responseData.data.product_id) {
            window.location.replace(
              "/cart/" +
                responseData.data.product_id +
                ":1?discount=" +
                responseData.data.coupon
            );
          } else {
            if (location.search.includes("cf_ref=referral")) {
              window.location.replace(
                "/discount/" +
                  responseData.data.coupon +
                  "?redirect=" +
                  location.pathname +
                  location.search
              );
            } else if (location.search === "") {
              window.location.replace(
                "/discount/" +
                  responseData.data.coupon +
                  "?redirect=" +
                  location.pathname +
                  location.search +
                  "?cf_ref=referral"
              );
            } else {
              window.location.replace(
                "/discount/" +
                  responseData.data.coupon +
                  "?redirect=" +
                  location.pathname +
                  location.search +
                  "&cf_ref=referral"
              );
            }
          }
        } else {
          emailInput.style.border = "1px solid red";
          emailInput.style.backgroundColor = "#ffe3e3";
          landingFormError.style.display = "block";
          landingFormError.innerHTML = responseData.message;
          emailInput.disabled = false;
          getCouponButton.disabled = false;
        }
      }
      const customer_id = Shopjar.cookieGet('cf_ram_cid') || __st.cid;
      const email = Shopjar.cookieGet('cf_ram_c_email');
      const ref_coupon = Shopjar.cookieGet('cf_ram_coupon') ? Shopjar.cookieGet('cf_ram_coupon') : sessionStorage.getItem('cf_ram_coupon');

      if (customer_id && !ref_coupon && email != "") {
        emailInput.disabled = true;
        getCouponButton.disabled = true;
        if (window.grecaptcha) {
          window.grecaptcha.ready(async () => {
            window.grecaptcha
              .execute(Shopjar.settings.recaptcha_site_key, {
                action: "submit",
              })
              .then(async (token) => {
                const data = {
                  token: token,
                  customer_id: customer_id,
                  email: email,
                  type: paramValue,
                  member_id: Shopjar.cookieGet('cf_ram_m')? Shopjar.cookieGet('cf_ram_m'): sessionStorage.getItem('cf_ram_m'),
                };
                await requestCoupon(data);
              });
          });
        }
      }
      if (landingPageForm) {
        //Handing Landing page Form Submit
        landingPageForm.onsubmit = async (event) => {
          event.preventDefault();
          emailInput.disabled = true;
          getCouponButton.disabled = true;
          if (window.grecaptcha) {
            window.grecaptcha.ready(() => {
              window.grecaptcha
                .execute(Shopjar.settings.recaptcha_site_key, {
                  action: "submit",
                })
                .then(async (token) => {
                  const data = {
                    email: emailInput.value,
                    type: 'referral',
                    member_id: Shopjar.cookieGet('cf_ram_m') ? Shopjar.cookieGet('cf_ram_m') : sessionStorage.getItem('cf_ram_m'),
                    token: token,
                  };
                  requestCoupon(data);
                });
            });
          }
        };
      }
      if (ref_coupon) {
        couponContainer.style.display = "flex";
        if (landingPopupFlexContainer)
          landingPopupFlexContainer.style.gap = "15px";
        if (title1) title1.style.display = "none";
        if (title2) title2.style.display = "block";
        if (subTitle1) subTitle1.style.display = "none";
        if (subTitle2) subTitle2.style.display = "block";
        landingPageFormContainer.style.display = "none";
        discountCode.innerHTML = ref_coupon;
        discountCode.style.display = "block";
        if (copyPrompt) copyPrompt.style.display = "block";
      }
    }

    Shopjar.updateCartAttr("cf_ram_reference",Shopjar.cookieGet("cf_ram_token")?Shopjar.cookieGet("cf_ram_token"):sessionStorage.getItem("cf_ram_token"));
  }
   affiliateParamValue = new URL(window.location.href).searchParams.get("sjram");
  if (
    (affiliateParamValue ||
      (Shopjar.cookieGet("cf_ram_user_key") !== "referral" &&
        Shopjar.cookieGet("cf_ram_user_key"))) &&
    !Shopjar.cookieGet("cf_ram_token") &&
    Shopjar.settings.is_affiliate_enabled
  ) {
    Shopjar.cookieSet(
      "cf_ram_t",
      "affiliate",
      Number(Shopjar.settings.cookie_validity)
    );
    const data = {
      nano_id: affiliateParamValue || Shopjar.cookieGet("cf_ram_user_key"),
    };
    if (data.nano_id && !Shopjar.cookieGet("cf_ram_token")) {
      (async () => {
        const response = await fetch(
          Shopjar.settings.proxy_url + "/affiliate/add-tracker",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          }
        );
        let responseData = await response.json();
        if (responseData.status) {
          Shopjar.cookieSet(
            "cf_ram_token",
            responseData.data.token,
            Number(Shopjar.settings.cookie_validity)
          );
          sessionStorage.setItem("cf_ram_token", responseData.data.token);
          if (responseData.data.coupon){
            Shopjar.cookieSet(
              "discount_code",
              responseData.data.coupon,
              Number(Shopjar.settings.cookie_validity)
            );
          sessionStorage.setItem("discount_code",responseData.data.token);
          }
          Shopjar.updateCartAttr("cf_ram_reference",responseData.data.token);
        }
      })();
    }
  } else {
    Shopjar.updateCartAttr("cf_ram_reference",Shopjar.cookieGet("cf_ram_token")?Shopjar.cookieGet("cf_ram_token"):sessionStorage.getItem("cf_ram_token"));
  }
};

if(paramValue &&
    (Shopjar.cookieGet("cf_ram_m")|| sessionStorage.getItem('cf_ram_m') )&&
    Shopjar?.settings?.is_referral_enabled &&
    paramValue === "referral"||(affiliateParamValue ||
      (Shopjar.cookieGet("cf_ram_user_key") !== "referral" &&
        Shopjar.cookieGet("cf_ram_user_key"))) &&
    !Shopjar.cookieGet("cf_ram_token") &&
    Shopjar.settings.is_affiliate_enabled){
Shopjar.loadScriptByURL(
  "sj_referral_affiliate_g_recaptcha",
  "https://www.google.com/recaptcha/api.js?render=" +
    Shopjar.settings.recaptcha_site_key,
  Shopjar.referral_reward_claim_popup_init
);
    }

var specialKeys = [32, 45, 91, 93, 40, 41, 43, 46, 44]
function IsNumeric(e) {
  var keyCode = e.which ? e.which : e.keyCode
  var ret =
    (keyCode >= 48 && keyCode <= 57) || specialKeys.indexOf(keyCode) != -1
  return ret
}
(Shopjar.referral_landing_page_init = async function () {
  console.log("recaptcha landing working")
  if(window.Shopjar?.rlp_triggered){
  let root = document.querySelector('#sj_landing_page_main')
  if (root) {
    let content = document.querySelector('#sj_landing_page')
    let clonedContent = content.cloneNode(true)
    root.appendChild(clonedContent)
    // Remove the original content
    content.remove()
  } else {
    let content = document.querySelector('#sj_landing_page')
    content.remove()
  }
  let session = sessionStorage.getItem('cf_ram_session')
  if (session) {
    let main = document.querySelector('.cf_ram_landing_page_wrapper')
    if (main) {
      let secondPage = document.querySelector('.cf_ram_user_page_container')
      let clonedContent = secondPage.cloneNode(true)
      main.appendChild(clonedContent)
      // Remove the original content
      secondPage.remove()
    }
  }
  let copied_link = Shopjar.settings.copied_link
  let invite_friend = Shopjar.settings.invite_friend
  let invalid_email = Shopjar.settings.invalid_email
  let order_contain_value = Shopjar.settings.order_contain_value
  const wrapper = document.querySelector('.cf_ram_landing_page_wrapper')
  const guestEvents = () => {
    const guestNameInput = document.querySelector('#cf_ram_guest_name_input')
    const guestEmailInput = document.querySelector('#cf_ram_guest_email_input')

    const guestinputName = document.querySelector('#guest_input_name')

    const guestinputPhone = document.querySelector('#guest_input_phone')

    const guestinputEmail = document.querySelector('#guest_input_email')

    const phoneInput = document.querySelector('#cf_ram_guest_phone_input')

    const guestSubmitButton = document.querySelector(
      '#cf_ram_guest_submit_button',
    )
    const loginButtonContainer = document.getElementById(
      'cf_ram_guest_submit_button_container_id',
    )
    const guestForm = document.querySelector('.cf_ram_guest_form')
    const guestloaderCon = document.querySelector('.cf_ram_guest_loader_con')

    const guestError = document.querySelector('.cf_ram_guest_error')

    if (guestForm) {
      loginButtonContainer.addEventListener('click', async (e) => {
        e.preventDefault()
        const guestName = guestNameInput.value.trim()
        const guestEmail = guestEmailInput.value.trim()
        guestinputName.style.borderColor = '#aba6a6'
        guestinputEmail.style.borderColor = '#aba6a6'

        if (guestName === '' || guestName === null || guestName === undefined) {
          guestinputName.focus()
          guestinputName.style.borderColor = 'red'
          return false
        }
        var phone = ''

        if (Shopjar.landing_page?.guest_phone) {
          phone = phoneInput.value.trim()
          guestinputPhone.style.borderColor = '#aba6a6'
          if (Shopjar.landing_page?.guest_phone_required) {
            if (phone === '' || phone === null || phone === undefined) {
              guestinputPhone.focus()
              guestinputPhone.style.borderColor = 'red'

              return false
            }
            
            if (phone !== '' || phone !== null || phone !== undefined) {
              let isvalid =/^[0-9 +,[\]().-]{4,17}$/.test(String(phone))
              if (!isvalid) {
                guestinputPhone.focus()
                guestinputPhone.style.borderColor = 'red'
                return false
              }
            }
          }
        }

        if (
          guestEmail === '' ||
          guestEmail === null ||
          guestEmail === undefined
        ) {
          guestinputEmail.focus()
          guestinputEmail.style.borderColor = 'red'
          return false
        }

        guestloaderCon.style.display = 'flex'
        guestSubmitButton.disabled = true
        const cookieName = 'cf_ram_' + guestEmailInput.value

        const cookie = await cFRAMLandingPageGetCookie(cookieName)
        sjRemoveClassList(wrapper)
        if (cookie) {
          const cookieData = JSON.parse(window.atob(cookie))
          document.querySelector('.cf_ram_guest_page_container').style.display =
            'none'
          let main = document.querySelector('.cf_ram_landing_page_wrapper')
          if (main) {
            let secondPage = document.querySelector(
              '.cf_ram_user_page_container',
            )
            let clonedContent = secondPage.cloneNode(true)
            main.appendChild(clonedContent)
            // Remove the original content
            secondPage.remove()
          }

          document.querySelector('.cf_ram_user_page_container').style.display =
            'block'
          sessionStorage.setItem(
            'cf_ram_session',
            JSON.stringify({
              referralLink: cookieData.link,
              cookieName: cookieName,
            }),
          )
          await userEvents(cookieData.link, cookieName)
        } else {
          if (window.grecaptcha) {
            window.grecaptcha.ready(() => {
              window.grecaptcha
                .execute(Shopjar.settings.recaptcha_site_key, {
                  action: 'submit',
                })
                .then(async (token) => {
                  const guestData = {
                    guestName,
                    guestEmail,
                    phone,
                    token,
                  }
                  guestError.style.display = 'none'

                  const url =
                    'https://' +
                    window.location.hostname +
                    Shopjar.settings.proxy_url +
                    '/referral/advocate/page-sign-up'
                  const res = await fetch(url, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(guestData),
                  })
                  const data = await res.json()
                  guestloaderCon.style.display = 'none'

                  guestSubmitButton.disabled = false
                  if (data.status) {
                    document.querySelector(
                      '.cf_ram_guest_page_container',
                    ).style.display = 'none'
                    let main = document.querySelector(
                      '.cf_ram_landing_page_wrapper',
                    )
                    if (main) {
                      let secondPage = document.querySelector(
                        '.cf_ram_user_page_container',
                      )
                      let clonedContent = secondPage.cloneNode(true)
                      main.appendChild(clonedContent)
                      // Remove the original content
                      secondPage.remove()
                    }
                    document.querySelector(
                      '.cf_ram_user_page_container',
                    ).style.display = 'block'
                    let cookieName = 'cf_ram_' + guestEmail
                    let cookieData = JSON.stringify({
                      link: data.data.referralLink,
                      mid: data.data.memberId,
                    })
                    cookieData = window.btoa(cookieData)
                    cFRAMLandingPageSetCookie(
                      cookieName,
                      cookieData,
                      Number(Shopjar.settings.cookie_validity),
                    )
                    sessionStorage.setItem(
                      'cf_ram_session',
                      JSON.stringify({
                        referralLink: data.data.referralLink,
                        cookieName: cookieName,
                      }),
                    )
                    userEvents(data.data.referralLink, cookieName)
                  } else {
                    if (
                      data.message === 'Invalid email' ||
                      data.message === invalid_email ||
                       data.message == order_contain_value
                    ) {
                      guestinputEmail.style.borderColor = 'red'
                      guestError.style.display = 'block'
                      guestError.innerHTML = data.message
                    }
                    if (data.message === 'Invalid name') {
                      guestinputName.style.borderColor = 'red'
                    }

                    if (data.message === 'invalid_phone_number') {
                      guestinputPhone.style.borderColor = 'red'
                    }
                    if (data.message === 'Failed to create member') {
                      guestError.style.display = 'block'
                      guestError.innerHTML = data.message
                    }
                  }
                })
            })
          }
        }
      })
    }
  }
  const userEvents = async (referralLink, cookieName) => {
    document.querySelector('.cf_ram_guest_page_container').style.display =
      'none'
    document.querySelector('.cf_ram_user_page_container').style.display =
      'block'

  let root = document.querySelector('#sj_landing_page_main')
  if (root) {
    let content = document.querySelector('.cf_ram_user_page_container')
    let clonedContent = content.cloneNode(true)
    root.appendChild(clonedContent)
    // Remove the original content
    content.remove()
  } else {
    let content = document.querySelector('.cf_ram_user_page_container')
    content.remove()
  }
    if (referralLink || sessionItem?.referralLink) {
      sjRemoveClassList(wrapper)
    }

    const showShareOptions = async (referralLink) => {
      let loading = true
      // const url =
      //   Shopjar.settings.aws_url + '/assets/json/settings.json?t=' + String(Date.now())
      // const result = await fetch(url)

      let shareSettings
      let isNoneActive = true
      // if (result.status === 200) {
      const data = Shopjar.settings.referral.share_options
      loading = false
      // {% raw  %}
      if (data) {
        shareSettings = JSON.parse(
          JSON.stringify(data)
            .replace(
              /{{\s?referral_link\s?}}/g,
              referralLink ? referralLink : sessionItem?.referralLink,
            )
            .replace(/{{\s?store_url\s?}}/g, window.location.origin),
        )
      }
      // }
      // {% endraw %}
      const userShareBlock = document.querySelector('.cf_ram_user_share_block')
      if (userShareBlock) {
        userShareBlock.style.display = 'block'
      }

      const userFacebookShare = document.querySelector(
        '#cf_ram_user_facebook_share',
      )
      if (shareSettings?.facebook.isEnabled) {
        isNoneActive = false
        userFacebookShare.style.display = 'block'
        userFacebookShare.href =
          'https://www.facebook.com/sharer/sharer.php?u=' + referralLink
      }
      const userTwitterShare = document.querySelector(
        '#cf_ram_user_twitter_share',
      )
      if (shareSettings?.twitter.isEnabled) {
        isNoneActive = false
        userTwitterShare.style.display = 'block'
        userTwitterShare.href =
          'https://twitter.com/intent/tweet?' +
          'text=' +
          shareSettings.twitter.message
      }
      const userEmailShare = document.querySelector('#cf_ram_user_email_share')
      if (shareSettings?.email.isEnabled) {
        isNoneActive = false
        userEmailShare.style.display = 'block'
        userEmailShare.href =
          'mailto:?subject=' +
          shareSettings.email.subject +
          '&body=' +
          shareSettings.email.message
      }
      const userWhatsappShare = document.querySelector(
        '#cf_ram_user_whatsapp_share',
      )
      if (shareSettings?.whatsapp.isEnabled) {
        isNoneActive = false
        userWhatsappShare.style.display = 'block'
        userWhatsappShare.href =
          'https://api.whatsapp.com/send?text=' + shareSettings.whatsapp.message
      }
      if (isNoneActive) {
        userShareBlock.style.display = 'none'
      }
    }

    if (referralLink || sessionItem?.referralLink)
      showShareOptions(referralLink)
    const userTandC = document.querySelector('.cf_ram_tandc')
    const hiddenInput = document.createElement('input')
    hiddenInput.setAttribute('type', 'hidden')
    const copyToClipboardButton = document.querySelector(
      '.cf_ram_user_copy_button',
    )
    const userSubmitButton = document.querySelector(
      '#cf_ram_user_submit_button',
    )
    const userInviteButton = document.getElementById(
      'cf_ram_user_submit_button_container_id',
    )

    const userEmailInput = document.getElementById(
      'cf_ram_user_input_field_email_ids',
    )

    const userEmail = document.getElementById('cf_ram_user_input_email')

    const userResponse = document.querySelector('.cf_ram_user_response')
    const userLoader = document.querySelector('#cf_ram_user_loader')
    const userReferralLink = document.querySelector(
      '#cf_ram_user_referral_link',
    )
    const userInputContainers = document.querySelectorAll(
      '.cf_ram_user_input_container',
    )
    const userGetReferralLink = document.querySelector(
      '.cf_ram_user_get_link_button',
    )
    const inviteSection = document.querySelector('#cf_ram_user_invite_section')

    if (referralLink || sessionItem?.referralLink) {
      userReferralLink.setAttribute(
        'value',
        referralLink ? referralLink : sessionItem?.referralLink,
      )
      userGetReferralLink.disabled = true
    } else {
      if (inviteSection) inviteSection.style.display = 'none'
      userGetReferralLink.style.display = 'block'
      userInputContainers.forEach((container) => {
        container.style.display = 'none'
      })
      // userTandC.style.display = "none";
    }
    if (userGetReferralLink) {
      userGetReferralLink.addEventListener('click', async (e) => {
        userGetReferralLink.disabled = true
        userGetReferralLink.style.opacity = 0.5

        if (window.grecaptcha) {
          window.grecaptcha.ready(() => {
            window.grecaptcha
              .execute(Shopjar.settings.recaptcha_site_key, {
                action: 'submit',
              })
              .then(async (token) => {
                e.preventDefault()
                const url =
                  'https://' +
                  window.location.hostname +
                  Shopjar.settings.proxy_url +
                  '/referral/page'
                const res = await fetch(url, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    customerId: __st.cid,
                    token: token,
                  }),
                })
                const data = await res.json()
                userGetReferralLink.disabled = false
                userGetReferralLink.style.opacity = 1
                if (data.status) {
                  cookieName = 'cf_ram_' + data.data.emailId
                  sjRemoveClassList(wrapper)
                  hiddenInput.setAttribute('value', cookieName)
                  let cookieData = JSON.stringify({
                    link: data.data.referralLink,
                    mid: data.data.memberId,
                  })
                  cookieData = window.btoa(cookieData)
                  cFRAMLandingPageSetCookie(
                    cookieName,
                    cookieData,
                    Number(Shopjar.settings.cookie_validity),
                  )
                  sessionStorage.setItem(
                    'cf_ram_session',
                    JSON.stringify({
                      referralLink: data.data.referralLink,
                      cookieName: cookieName,
                    }),
                  ),
                    userReferralLink.setAttribute(
                      'value',
                      data.data.referralLink,
                    )

                  userInputContainers.forEach((container) => {
                    container.style.display = 'flex'
                  })
                  inviteSection.style.display = 'block'
                  // userTandC.style.display = "block";
                  cookieName = 'cf_ram_' + data.data.emailId
                  userGetReferralLink.style.display = 'none'
                  showShareOptions(data.data.referralLink)
                } else {
                   if(data.message == order_contain_value){
                       let userError= document.querySelector(".cf_ram_user_error_message");
                          // guestinputEmail.style.borderColor = 'red'
                          userError.style.display = 'block'
                          userError.innerHTML = data.message
                      }
                  guestEvents()
                }
              })
          })
        }
      })
    }
    const userForm = document.querySelector('.cf_ram_user_form')
    if (userForm) {
      userInviteButton.addEventListener('click', async (e) => {
        e.preventDefault()
        const inviteEmail = userEmailInput.value.trim()
        userEmail.style.borderColor = '#aba6a6'
        if (
          inviteEmail === '' ||
          inviteEmail === null ||
          inviteEmail === undefined
        ) {
          userEmail.style.borderColor = '#FF0000'
          return false
        }
        userSubmitButton.disabled = true
        userLoader.style.display = 'flex'
        if (window.grecaptcha) {
          window.grecaptcha.ready(() => {
            window.grecaptcha
              .execute(Shopjar.settings.recaptcha_site_key, {
                action: 'submit',
              })
              .then(async (token) => {
                let member_id
                if (cookieName.split('_')[2] != 'undefined') {
                  const cookie = await cFRAMLandingPageGetCookie(cookieName)
                  if (cookie) {
                    member_id = JSON.parse(window.atob(cookie)).mid
                  } else {
                    const rawCookie = await cFRAMLandingPageGetCookie(
                      hiddenInput.value,
                    )
                    member_id = JSON.parse(window.atob(rawCookie)).mid
                  }
                } else {
                  const rawCookie = await cFRAMLandingPageGetCookie(
                    hiddenInput.value,
                  )
                  member_id = JSON.parse(window.atob(rawCookie)).mid
                }
                //get loader 1
                const url =
                  'https://' +
                  window.location.hostname +
                  Shopjar.settings.proxy_url +
                  '/referral/advocate/invite-friend'
                const res = await fetch(url, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    email: inviteEmail,
                    member_id: member_id,
                    token: token,
                    type: 'referral',
                  }),
                })

                const data = await res.json()
                if (data) {
                  userLoader.style.display = 'none'
                  userSubmitButton.disabled = false
                }
                if (data.status) {
                  userResponse.style.display = 'block'
                  userResponse.style.color = '#000000'
                  userResponse.innerHTML = data.message
                  if (invite_friend) {
                    userSubmitButton.value = invite_friend
                  } else {
                    userSubmitButton.value = 'Sent!'
                  }
                  setTimeout(() => {
                    userResponse.style.display = 'none'
                    userSubmitButton.value =
                      Shopjar.landing_page.user_submit_button_text
                  }, 3000)
                } else {
                  userResponse.style.display = 'block'
                  userResponse.style.color = '#FF0000'
                  userEmail.style.borderColor = '#FF0000'
                  userResponse.innerHTML = data.message
                  setTimeout(() => {
                    userResponse.style.display = 'none'
                  }, 3000)
                }
              })
          })
        }

        //
      })
    }
    if (copyToClipboardButton) {
      copyToClipboardButton.onclick = async () => {
        try {
          await navigator.clipboard.writeText(userReferralLink.value)
        } finally {
          if (copied_link) {
            copyToClipboardButton.innerText = copied_link
          } else {
            copyToClipboardButton.innerText = 'Copied!'
          }
          setTimeout(() => {
            copyToClipboardButton.innerText =
              Shopjar.landing_page.user_copy_button_text
          }, 5000)
        }
      }
    }
  }

  function sjRemoveClassList(wrapper) {
    if (wrapper.classList.contains('sj_referral_first_page')) {
      wrapper.classList.remove('sj_referral_first_page')
    }
  }
  let sessionItem = sessionStorage.getItem('cf_ram_session')
  try {
    sessionItem = JSON.parse(sessionItem)
  } catch (error) {
    sessionItem = null
  }
  if (__st.cid) userEvents()
  else if (sessionItem?.referralLink && sessionItem?.cookieName) {
    userEvents(sessionItem.referralLink, sessionItem.cookieName)
  } else {
    sessionStorage.removeItem('cf_ram_session')
    guestEvents()
  }
}
})
if(Shopjar.rlp_triggered){
  Shopjar.loadScriptByURL(
    'spring_referral_grecaptcha',
    'https://www.google.com/recaptcha/api.js?render=' +
      Shopjar.settings.recaptcha_site_key,
    Shopjar.referral_landing_page_init,
  )
  }
Shopjar.referral_launcher_init=function(){
if(!window.Shopjar.settings?.is_referral_enabled||window.Shopjar.launcher_data?.status!=="ACTIVE"){
  let maindiv=document.querySelector(".cf_ram_widget");
    maindiv.style.display="none";
}

  function toggleElement(element, show) {
    const isVisible =
      element.classList.contains('show') || !element.classList.contains('hide')
    if (show && isVisible) {
      element.classList.add('show')
    }

    if (show && !isVisible) {
      element.classList.add('show')
      element.classList.remove('hide')
    }
    if (!show && isVisible) {
      element.classList.add('hide')
      element.classList.remove('show')
    }
    if (!show && !isVisible) {
      element.classList.add('hide')
    }
  }
  // load the script by passing the URL
  Shopjar.loadScriptByURL(
    'spring_referral_grecaptcha',
    'https://www.google.com/recaptcha/api.js?render='+Shopjar.settings.recaptcha_site_key,
    function () {
  const launcherButton = document.querySelector('#cf_ram_widget_button')
  const launcherWidgetOne = document.querySelector('.cf_ram_widget_card_one')
  const launcherWidgetTwo = document.querySelector('.cf_ram_widget_card_two')
  const inviteButton = document.querySelector('.cf_ram_widget_submit')
  const invite = document.querySelector('.cf_ram_widget_invite_btn')
  const copyLink = document.querySelector('.cf_ram_widget_copy')
  const socialIconGroup = document.querySelector('.social_icon_group')
  const launcherButtonClose = document.querySelector('.cf_ram_widget_button_close')
  const copyButton = document.querySelector('.cf_ram_widget_copy_btn')
  const subTitleOne = document.querySelector('.cf_ram_subtitle_one')
  const subTitleTwo = document.querySelector('.cf_ram_subtitle_two')
  const titleOne = document.querySelector('.cf_ram_title_one')
  const titleTwo = document.querySelector('.cf_ram_title_two')
  const twitterLink = document.querySelector('#cf_ram_twitter_link')
  const facebookLink = document.querySelector('#cf_ram_facebook_link')
  const emailLink = document.querySelector('#cf_ram_email_link')
  const whatsappLink = document.querySelector('#cf_ram_whatsapp_link')

  const popupClosebtnOne = document.querySelector('.cf_ram_close_one')
  const popupClosebtnTwo = document.querySelector('.cf_ram_close_two')

  const loaderCon = document.querySelector('.cf_ram_loader_con')
  const loaderConTwo = document.querySelector('.cf_ram_loader_con_two')
  const errorMessage = document.querySelector('.cf_ram_launcher_page_error')
  const emailInputText = document.querySelector('#cf_ram_input_text')
  const copyTextLink = document.querySelector('.cf_ram_widget_copy_text')
  launcherButton.addEventListener('click', () => {
    if (sessionStorage.getItem('cf_ram_launcher')) {
      const sessionData = JSON.parse(sessionStorage.getItem('cf_ram_launcher'))
      if (__st.cid) {
        if (sessionData.customer_id === __st.cid) {
          toggleElement(launcherWidgetTwo, true)
          toggleElement(launcherWidgetOne, false)
          toggleElement(launcherButton, false)
          toggleElement(launcherButtonClose, true)
          getSessionStorage()
        } else {
          loaderConTwo.style.display = 'inline-block'
          toggleElement(launcherWidgetTwo, true)
          toggleElement(launcherWidgetOne, false)
          toggleElement(launcherButton, false)
          toggleElement(launcherButtonClose, true)
          getSocialLink()
        }
      } else {
        if (sessionData.customer_id) {
          sessionStorage.removeItem('cf_ram_launcher')
          toggleElement(launcherWidgetOne, true)
          toggleElement(launcherWidgetTwo, false)
          toggleElement(launcherButton, false)
          toggleElement(launcherButtonClose, true)
        } else {
          toggleElement(launcherWidgetOne, false)
          toggleElement(launcherWidgetTwo, true)
          toggleElement(launcherButton, false)
          toggleElement(launcherButtonClose, true)
          getSessionStorage()
        }
      }
    } else {
      if (__st.cid) {
        loaderConTwo.style.display = 'inline-block'
        toggleElement(launcherWidgetOne, false)
        toggleElement(launcherWidgetTwo, true)
        toggleElement(launcherButton, false)
        toggleElement(launcherButtonClose, true)
        getSocialLink()
      } else {
        toggleElement(launcherWidgetOne, true)
        toggleElement(launcherButton, false)
        toggleElement(launcherButtonClose, true)
      }
    }
  })
  invite.addEventListener('click', () => {
    getSocialLink()
    loaderCon.style.display = 'inline-block'
  })

  popupClosebtnTwo.addEventListener('click', () => {
    toggleElement(launcherWidgetTwo, false)
    toggleElement(launcherButtonClose, false)
    toggleElement(launcherButton, true)
  })
  popupClosebtnOne.addEventListener('click', () => {
    toggleElement(launcherWidgetOne, false)
    toggleElement(launcherButtonClose, false)
    toggleElement(launcherButton, true)
  })

  launcherButtonClose.addEventListener('click', () => {
    toggleElement(launcherWidgetOne, false)
    toggleElement(launcherWidgetTwo, false)
    toggleElement(launcherButtonClose, false)
    toggleElement(launcherButton, true)
  })

  async function getSessionStorage() {
    const responseData = JSON.parse(sessionStorage.getItem('cf_ram_launcher'))
    copyTextLink.value = responseData.referralLink

    if (responseData.is_facebook_enabled) {
      facebookLink.href = 'https://www.facebook.com/sharer/sharer.php?u='.concat(
        responseData.referralLink,
      )
    } else {
      toggleElement(facebookLink, false)
    }
    if (responseData.is_twitter_enabled) {
      twitterLink.href = 'https://twitter.com/intent/tweet?text='.concat(
        responseData.twitter_message,
      )
    } else {
      toggleElement(twitterLink, false)
    }
    if (responseData.is_email_enabled) {
      emailLink.href = 'mailto:?subject='.concat(
        responseData.email_subject,
        '&body=',
        responseData.email_message,
      )
    } else {
      toggleElement(emailLink, false)
    }
    if (responseData.is_whatsapp_enabled) {
      whatsappLink.href = 'https://api.whatsapp.com/send?text='.concat(
        responseData.whatsapp_message,
      )
    } else {
      toggleElement(whatsappLink, false)
    }
    toggleElement(errorMessage, false)
    copyButton.onclick = async () => {
      await navigator.clipboard.writeText(responseData.referralLink)
      if(Shopjar?.launcher_data.copied_link){
       copyButton.textContent = Shopjar?.launcher_data.copied_link
      }else{
       copyButton.textContent = 'Copied!' 
      }
      setTimeout(() => {
        copyButton.textContent = Shopjar.launcher_data.copy_button_text
      }, 3000)
    }
  }

  async function getSocialLink() {
    let checkout
    if (Shopify?.checkout) {
      checkout = Shopify.checkout
    }
    let data
    let email
    if (!checkout?.email || typeof checkout.email !== 'string') {
      email = false
    } else {
      email = checkout.email
      //get referral link and show it
    }
    if (__st.cid&&__st.cid!=="") {
      data = {
        remote_customer_id: __st.cid,
      }
    } else {
      data = {
        email: emailInputText.value,
        // remote_customer_id: __st.cid,
      }
    }

    if (window.grecaptcha) {
      window.grecaptcha.ready(() => {
        window.grecaptcha
          .execute(Shopjar.settings.recaptcha_site_key, {
            action: 'submit',
          })
          .then(async (token) => {
            const response = fetch(Shopjar.settings.proxy_url+'/launcher/referral/link', {
              method: 'POST',
              body: JSON.stringify({
                ...data,
                ...{ token: token },
              }),
            }).then((response) => {
              response.json().then((response) => {
                let responseData = response
                if (responseData.status) {
                  sessionStorage.setItem(
                    'cf_ram_launcher',
                    JSON.stringify({
                      ...responseData.fields,
                      customer_id: __st.cid,
                    }),
                  )
                  loaderCon.style.display = 'none'
                  loaderConTwo.style.display = 'none'
                  toggleElement(launcherWidgetOne, false)

                  toggleElement(launcherWidgetTwo, true)

                  if (responseData.fields.referralLink) {
                    if (subTitleTwo) toggleElement(subTitleTwo, true)

                    if (titleTwo) toggleElement(titleTwo, true)

                    toggleElement(socialIconGroup, true)

                    copyTextLink.value = responseData.fields.referralLink

                    if (responseData.fields.is_facebook_enabled) {
                      facebookLink.href = 'https://www.facebook.com/sharer/sharer.php?u='.concat(
                        responseData.fields.referralLink,
                      )
                    } else {
                      toggleElement(facebookLink, false)
                    }
                    if (responseData.fields.is_twitter_enabled) {
                      twitterLink.href = 'https://twitter.com/intent/tweet?text='.concat(
                        responseData.fields.twitter_message,
                      )
                    } else {
                      toggleElement(twitterLink, false)
                    }
                    if (responseData.fields.is_email_enabled) {
                      emailLink.href = 'mailto:?subject='.concat(
                        responseData.fields.email_subject,
                        '&body=',
                        responseData.fields.email_message,
                      )
                    } else {
                      toggleElement(emailLink, false)
                    }
                    if (responseData.fields.is_whatsapp_enabled) {
                      whatsappLink.href = 'https://api.whatsapp.com/send?text='.concat(
                        responseData.fields.whatsapp_message,
                      )
                    } else {
                      toggleElement(whatsappLink, false)
                    }
                    toggleElement(errorMessage, false)
                  } else {
                    toggleElement(launcherWidgetOne, true)
                    toggleElement(errorMessage, true)
                    errorMessage.innerHTML = responseData.message
                  }
                  copyButton.onclick = async () => {
                    await navigator.clipboard.writeText(
                      responseData.fields.referralLink,
                    )
                   if(Shopjar?.launcher_data.copied_link){
                   copyButton.textContent = Shopjar?.launcher_data.copied_link
                   }else{
                   copyButton.textContent = 'Copied!' 
                   }
                 setTimeout(() => {
                  copyButton.textContent = Shopjar.launcher_data.copy_button_text
                  }, 3000)
                  }
                } else {
                  loaderCon.style.display = 'none'
                  loaderConTwo.style.display = 'none'
                  toggleElement(launcherWidgetTwo, false)
                  toggleElement(launcherWidgetOne, true)
                  toggleElement(errorMessage, true)
                  errorMessage.innerHTML = responseData.message
                }
              })
            })
          })
      })
    }
  }
},
  )
  
}
if(window.Shopjar.rl_triggered){

  Shopjar.referral_launcher_init();
}
Shopjar.affiliate_request_form_init=function () {
      Shopjar.updateDom();
      const affiliateLoader = document.querySelector(".cf_ram_affiliate_loader_container");
      const affiliateRequestError = document.querySelector(".cf_ram_affiliate_request_error");
      const affiliateRequestStatus = document.querySelector(".cf_ram_affiliate_request_status_section");
      const affiliateRequestContainer = document.querySelector(".cf_ram_affiliate_request_page_container");
      const affiliateRequestSubmit = document.querySelector(".cf_ram_submit_button");
      const affiliateRequestCombinedInputBox = document.querySelectorAll(".cf_ram_affiliate_input_box");
      let firstName = "";
      const firstNameInput = document.querySelector("#cf_ram_affiliate_request_first_name_input");
      let lastName = "";
      const lastNameInput = document.querySelector("#cf_ram_affiliate_request_last_name_input");
      let email = "";
      const emailInput = document.querySelector("#cf_ram_affiliate_request_email_input");
      let phone = "";
      const phoneInput = document.getElementById("cf_ram_affiliate_request_phone_input");
      let paypalEmail = "";
      const paypalEmailInput = document.querySelector("#cf_ram_affiliate_request_paypal_email_input");
      let addressLine1 = "";
      const addressLine1Input = document.querySelector("#cf_ram_affiliate_request_address_line_1_input");
      let addressLine2 = "";
      const addressLine2Input = document.querySelector("#cf_ram_affiliate_request_address_line_2_input");
      let city = "";
      const cityInput = document.querySelector("#cf_ram_affiliate_request_city_input");
      let zipCode = "";
      const zipCodeInput = document.querySelector("#cf_ram_affiliate_request_zip_code_input");
      let country = "";
      const countryInput = document.querySelector("#cf_ram_affiliate_request_country_input");
      let state = "";
      const stateInput = document.querySelector("#cf_ram_affiliate_request_state_input");
      let websites = "";
      const websitesInput = document.querySelector("#cf_ram_affiliate_request_websites_input");
      let planning = "";
      const planningInput = document.querySelector("#cf_ram_affiliate_request_planning_input");
      let faceBookLink = "";
      const faceBookLinkInput = document.querySelector("#cf_ram_affiliate_request_facebook_link_input");
      let instagramLink = "";
      const instagramLinkInput = document.querySelector("#cf_ram_affiliate_request_instagram_link_input");
      let youTubeLink = "";
      const youTubeLinkInput = document.querySelector("#cf_ram_affiliate_request_youtube_link_input");
      let tiktokLink = "";
      const tiktokLinkInput = document.querySelector("#cf_ram_affiliate_request_tiktok_link_input");
      const affiliateRequestForm = document.querySelector(".cf_ram_affiliate_request_form");
      const affiliateRequestButton = document.querySelector("#cf_ram_submit_button_section_id");
      function validateInput(value, type = "text") {
        if (value === "" || value === null || value === undefined) {
          return false;
        }
        if (type === "email") {
          if (/^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[A-Za-z]+$/.test(value)) {
            
            return true;
          }
          return false;
        }
      
        return true;
      }
      function processAndValidateInputs() {
        affiliateRequestCombinedInputBox.forEach((el,index)=>{
           el.style.borderColor="#e2e3e9"
        })
        if (!validateInput(firstName)) {
          firstNameInput.focus();
          firstNameInput.style.borderColor = "red";
          return false;
        }
        if (Shopjar.Affiliate_page.last_name_required === true && !validateInput(lastName)) {
          lastNameInput.focus();
          lastNameInput.style.borderColor = "red";
          return false;
        }

        if (!validateInput(email, "email")) {
          emailInput.focus();
          emailInput.style.borderColor = "red";
          return false;
        }
        if (Shopjar.Affiliate_page.phone_required === true && !phone) {
          phoneInput.focus();
          phoneInput.style.borderColor = "red";
          return false;
        } else if (phone) {
         let isvalid =/^[0-9 +,[\]().-]{4,17}$/.test(String(phone));
          if (!isvalid) {
            phoneInput.focus();
            phoneInput.style.borderColor = "red";
            return false;
          }
        }
        if (Shopjar.Affiliate_page.paypal_email_status===true &&
          Shopjar.Affiliate_page.paypal_email_required===true &&
          !validateInput(paypalEmail, "email")
        ) {
          paypalEmailInput.focus();
          paypalEmailInput.style.borderColor = "red";
          return false;
        }

        if (Shopjar.Affiliate_page.address_line_one_status===true &&
          Shopjar.Affiliate_page.address_line_one_required===true &&
          !validateInput(addressLine1)
        ) {
          addressLine1Input.focus();
          addressLine1Input.style.borderColor = "red";
          return false;
        }

        if (
          Shopjar.Affiliate_page.address_line_two_status===true&&Shopjar.Affiliate_page.address_line_two_required===true&&
          !validateInput(addressLine2)
        ) {
          addressLine2Input.focus();
          addressLine2Input.style.borderColor = "red";
          return false;
        }

        if (Shopjar.Affiliate_page.city_status===true&&Shopjar.Affiliate_page.city_required===true&&!validateInput(city)) {
          cityInput.focus();
          cityInput.style.borderColor = "red";
          return false;
        }
        if (Shopjar.Affiliate_page.zip_code_status===true&&Shopjar.Affiliate_page.zip_code_required===true&&!validateInput(zipCode)
        ) {
          zipCodeInput.focus();
          zipCodeInput.style.borderColor = "red";
          return false;
        }

        if (Shopjar.Affiliate_page.country_status===true&&Shopjar.Affiliate_page.country_required===true&&
          !validateInput(country)
        ) {
          countryInput.focus();
          countryInput.style.borderColor = "red";
          return false;
        }

        if (Shopjar.Affiliate_page.state_status===true&&Shopjar.Affiliate_page.state_required===true&&
          !validateInput(state)
        ) {
          stateInput.focus();
          stateInput.style.borderColor = "red";
          return false;
        }

        if (Shopjar.Affiliate_page.websites_status===true&&Shopjar.Affiliate_page.websites_required===true &&
          !validateInput(websites)
        ) {
          websitesInput.focus();
          websitesInput.style.borderColor = "red";
          return false;
        }

        if (Shopjar.Affiliate_page.planning_status===true&&Shopjar.Affiliate_page.planning_required===true&&!validateInput(planning)) 
        {
          planningInput.focus();
          planningInput.style.borderColor = "red";
          return false;
        }

        if (Shopjar.Affiliate_page.facebook_link_status===true&&Shopjar.Affiliate_page.facebook_link_required===true&&
          !validateInput(faceBookLink)
        ) {
          faceBookLinkInput.focus();
          faceBookLinkInput.style.borderColor = "red";
          return false;
        }

        if (Shopjar.Affiliate_page.instagram_link_status===true&&Shopjar.Affiliate_page.instagram_link_required===true &&
          !validateInput(instagramLink)
        ) {
          instagramLinkInput.focus();
          instagramLinkInput.style.borderColor = "red";
          return false;
        }

        if (Shopjar.Affiliate_page.youtube_link_status===true&&Shopjar.Affiliate_page.youtube_link_required===true&&
          !validateInput(youTubeLink)
        ) {
          youTubeLinkInput.focus();
          youTubeLinkInput.style.borderColor = "red";
          return false;
        }

        if (Shopjar.Affiliate_page.tiktok_link_status===true&&Shopjar.Affiliate_page.tiktok_link_required===true&&
          !validateInput(tiktokLink)
        ) {
          tiktokLinkInput.focus();
          tiktokLinkInput.style.borderColor = "red";
          return false;
        }

        return true;
      }

      function affiliateRequestLoader(status) {
        affiliateLoader.style.display = status ? "flex" : "none";
      }

      function loadAffiliateRequestStatusUI(message, reset = true) {
        affiliateRequestError.style.display = "none";
        affiliateRequestStatus.style.display = "block";
        affiliateRequestStatus.innerHTML = message;
        document.body.scrollTop = document.documentElement.scrollTop = 0;
        affiliateRequestForm.reset();
      }

      function toggleaffiliateRequestError(message) {
        affiliateRequestError.innerHTML = message;
        affiliateRequestError.style.display = "block";
        document.body.scrollTop = document.documentElement.scrollTop = 0;
      }
      const userEvents = async () => {
        if (affiliateRequestForm) {
          affiliateRequestButton.addEventListener("click", async (event) => {
            event.preventDefault();
            firstName = firstNameInput && firstNameInput.value.trim();
            lastName = lastNameInput && lastNameInput.value.trim();
            email = emailInput && emailInput.value.trim();
            phone = phoneInput && phoneInput.value;
            paypalEmail = paypalEmailInput && paypalEmailInput.value.trim();
            addressLine1 = addressLine1Input && addressLine1Input.value.trim();
            addressLine2 = addressLine2Input && addressLine2Input.value.trim();
            city = cityInput && cityInput.value.trim();
            zipCode = zipCodeInput && zipCodeInput.value.trim();
            country = countryInput && countryInput.value.trim();
            state = stateInput && stateInput.value.trim();
            websites = websitesInput && websitesInput.value.trim();
            planning = planningInput && planningInput.value.trim();
            faceBookLink = faceBookLinkInput && faceBookLinkInput.value.trim();
            instagramLink =
              instagramLinkInput && instagramLinkInput.value.trim();
            youTubeLink = youTubeLinkInput && youTubeLinkInput.value.trim();
            tiktokLink = tiktokLinkInput && tiktokLinkInput.value.trim();

            if (!processAndValidateInputs()) return false;

            affiliateRequestLoader(true);
            affiliateRequestSubmit.disabled = true;

            if (window.grecaptcha) {
              window.grecaptcha.ready(() => {
                window.grecaptcha
                  .execute(Shopjar.settings.recaptcha_site_key, {
                    action: "submit",
                  })
                  .then(async (token) => {
                    let url =Shopjar.Affiliate_page.domain;
                    if(url == ''){
                      url = "https://" + window.location.hostname + "/a/shopjar-referral/affiliate/request";
                    }
                    const affiliateRequestFormData = {
                      firstName,
                      lastName,
                      email,
                      phone,
                      paypalEmail,
                      addressLine1,
                      addressLine2,
                      city,
                      zipCode,
                      country,
                      state,
                      websites,
                      planning,
                      faceBookLink,
                      instagramLink,
                      youTubeLink,
                      tiktokLink,
                      token,
                    };

                    const response = await fetch(url, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(affiliateRequestFormData),
                    });
                    const data = await response.json();
                    if (data.status) {
                      affiliateRequestLoader(false);
                      affiliateRequestSubmit.disabled = false;
                      loadAffiliateRequestStatusUI(data.message);
                    } else {
                      affiliateRequestLoader(false);
                      affiliateRequestSubmit.disabled = false;
                      if(data.message ===Shopjar.settings.invalid_email||data.message === 'Invalid email'){
                        emailInput.focus();
                        emailInput.style.borderColor = "red";
                      }
                      toggleaffiliateRequestError(data.message);
                    }
                  });
              });
            }
          });
        }
      };

      const getCustomerInfo = async () => {
        const url =
          "https://" +
          window.location.hostname +Shopjar.settings.proxy_url+
          "/affiliate/get-customer-info";
        let response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ customerId: __st.cid }),
        });
        return await response.json();
      };

      const loadUserDetails = async () => {
        affiliateRequestLoader(true);
        const customerInfo = await getCustomerInfo();
        const customer = customerInfo.data.customer;
        if (customer) {
          affiliateRequestLoader(false);
          firstNameInput.value = customer.first_name;
          lastNameInput.value = customer.last_name;
          emailInput.value = customer.email;
          phoneInput.value = customer?.default_address?.phone;
          zipCodeInput.value = customer?.default_address?.zip;
          countryInput.value = customer?.default_address?.country;
          addressLine1Input.value = customer?.default_address?.address1;
          addressLine2Input.value = customer?.default_address?.address2;
          cityInput.value = customer?.default_address?.city;
          stateInput.value = customer?.default_address?.province_code;
        }
      };

      if (window.__st?.cid) {
        loadUserDetails();
      }
      userEvents();
    }
   if(Shopjar.arp_triggered){
     Shopjar.loadScriptByURL('spring_affiliate_grecaptcha',
     'https://www.google.com/recaptcha/api.js?render='+Shopjar.settings.recaptcha_site_key,
     Shopjar.affiliate_request_form_init())
    }
