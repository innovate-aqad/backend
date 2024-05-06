export const downloadInvoice = async (fetchORderData) => {
  // objectFix
  //   const moment = require("moment");

  let { userAddressObj, variant_quantity, taxData } = fetchORderData;

  let productsRows = "";
  let totalPriceOfproducts = 0;
  let taxAmount = 0;
  let couponPrice = 0;
  let grandAmount = 0;
  // (Number(fetchORderData?.sub_total) * Number(taxData?.tax_value)) / 100;
  console.log(
    "tax",
    variant_quantity?.[0]?.variantObj?.variant_price_details?.[0]
  );

  for (let index = 0; index < variant_quantity.length; index++) {
    const row = variant_quantity[index];

    let price_details = row?.variantObj?.variant_price_details?.[0];
    price_details =
      Number(price_details?.price) -
      (Number(price_details?.price) * Number(price_details?.discount)) / 100;

    console.log("price_details", price_details, "price_details");
    let taxablePrice =
      Number(price_details) -
      (Number(price_details) * Number(taxData?.tax_value)) / 100;
    let TotalPrice = taxablePrice * row?.quantity;
    couponPrice =
      fetchORderData?.couponObj?.type === "fixed"
        ? Number(fetchORderData?.couponObj?.value)?.toFixed(2)
        : (Number(totalPriceOfproducts?.toFixed(2)) *
            Number(fetchORderData?.couponObj?.value)) /
            100 || 0;
    taxAmount = console.log("couponPrice", couponPrice, "couponPrice");
    totalPriceOfproducts += TotalPrice;

    taxAmount =
      ((Number(totalPriceOfproducts) - Number(couponPrice)) *
        Number(taxData?.tax_value)) /
      100;
    grandAmount =
      Number(totalPriceOfproducts) - Number(couponPrice) + Number(taxAmount);
    productsRows += `
    <tr style="font-size:14px; text-align:left; color:#000; font-weight:500; padding:10px 0px; border-bottom:1px solid #D7DAE0">
      <td style="padding:10px 0 10px 10px;"> 
        ${row?.findProductObj?.title} 
      </td>
      <td style="padding:10px 0 10px 10px;"> 
        ${price_details?.toFixed(2)} 
      </td>
      <td style="padding:10px 0 10px 10px;"> 
        ${taxablePrice?.toFixed(2)} 
      </td>
      <td style="padding:10px 0">
        ${row?.quantity}
      </td>
      <td style="padding:10px 10px 10px 0; text-align:right">
        ${
          variant_quantity?.[0]?.variantObj?.variant_price_details?.[0]
            ?.currency_symbol
        } ${TotalPrice?.toFixed(2)}
      </td>
    </tr>
    
    
    
    `;
  }

  let ProductHtml = `
  <div>
    <div style="display:flex; width:100%; background-color:#fff; border-radius:10px; border:1px solid #D7DAE0; padding:20px">

      <div style="display: flex;flex-direction:column;font-size:14px;text-align:left; color:#5E6470; width:35%">
        <div>Order id:<div style="color:#000; margin-bottom:10px"> ${
          fetchORderData?.order_id
        }</div></div>
        <div> Order Date:<div style="color:#000; margin-bottom:10px"> ${fetchORderData?.created_at
          ?.toString()
          ?.slice(0, 25)}</div></div>
        <div>Delivery Date:<div style="color:#000; margin-bottom:10px"> ${fetchORderData?.delivery_date
          ?.toString()
          ?.slice(0, 25)}</div></div>        
      </div>

      <div style="display:flex;flex-direction:column; text-align:left; width:35%">
        <div style="color:#5E6470; margin-bottom:10px">Billed to</div>
        <div style="margin-bottom:3px">${
          fetchORderData?.userAddressObj?.full_name
        }</div>
        <div style="margin-bottom:3px; line-height:18px">${
          userAddressObj?.house_no?.length !== 0
            ? `${userAddressObj?.house_no},`
            : ""
        } ${userAddressObj?.address},${userAddressObj?.city},${
    userAddressObj?.state
  },${userAddressObj?.zipcode}
        </div>
        <div>${userAddressObj?.mobile}</div>      
      </div>

      <div style="display: flex;flex-direction:column;font-size:14px;text-align:right;color:#5E6470; width:30%">
        <div>Invoice<div style="color: #032140;font-size:24px;font-weight:700; margin-bottom:10px">${
          variant_quantity?.[0]?.variantObj?.variant_price_details?.[0]
            ?.currency_symbol
        } ${grandAmount?.toFixed(2)}</div></div>        
      </div>

    </div>


    <div style="display:flex;flex-direction:column;">
      <div> 
    
     
    <div style="margin-top: 20px;">
      <div style="display: flex; text-align:left; width: 100%">
          <table style="border-collapse: collapse; width:100%; margin: 0 auto; text-align: left;">
              <thead style="background-color: #F6F8FC;">
                  <tr style="font-size:14px; text-align:left; color:#5E6470; padding:10px 0px; border-top:1px solid #D7DAE0; border-bottom:1px solid #D7DAE0">
                      <th style="padding:10px 0 10px 10px;">Product Name</th>
                      <th style="padding:10px 0 10px 10px;">Gross Amount</th>
                      <th style="padding:10px 0 10px 10px;">Taxable Amount</th>
                      <th style="padding:10px 0px;">Quantity</th>
                      <th style="padding:10px 10px; 10px 0; text-align:right">Total Amount</th>
                  </tr>
              </thead>
              <tbody>
                ${productsRows}

                <tr style="font-size:14px; text-align:left; color:#000; font-weight:500; padding:10px 0px;">
                  <td style="padding:10px 0"> 
                  
                  </td>
                  <td style="padding:10px 0"> 
                  
                  </td>
                  <td style="padding:10px 0"> 
                  
                  </td>
                  <td style="padding:10px 0">
                      Subtotal
                  </td>
                  <td style="padding:10px 10px 10px 0; text-align:right">
                  ${
                    variant_quantity?.[0]?.variantObj
                      ?.variant_price_details?.[0]?.currency_symbol
                  } ${totalPriceOfproducts?.toFixed(2)}
                  </td>
                </tr>
    
                <tr style="font-size:14px; text-align:left; color:#000; font-weight:500; padding:10px 0px;">
                  <td style="padding:10px 0"> 
                  
                  </td>
                  <td style="padding:10px 0"> 
                  
                  </td>
                  <td style="padding:10px 0"> 
                  
                  </td>
                  <td style="padding:10px 0; border-bottom:1px solid #D7DAE0">
                    Discounts/Coupons 
                  </td>
                  <td style="padding:10px 10px 10px 0; border-bottom:1px solid #D7DAE0; text-align:right">
                  ${
                    variant_quantity?.[0]?.variantObj
                      ?.variant_price_details?.[0]?.currency_symbol
                  }
                    ${Number(couponPrice)?.toFixed(2)}
                  </td>
                </tr>
    
                <tr style="font-size:14px; text-align:left; color:#000; font-weight:500; padding:10px 0px;">
                  <td style="padding:10px 0"> 
                  
                  </td>
                  <td style="padding:10px 0"> 
                  
                  </td>
                  <td style="padding:10px 0"> 
                  
                  </td>
                  <td style="padding:10px 0; border-bottom:1px solid #D7DAE0">
                    ${taxData?.tax_name} (${taxData?.tax_value}%)
                  </td>
                  <td style="padding:10px 10px 10px 0; border-bottom:1px solid #D7DAE0; text-align:right">
                  ${
                    variant_quantity?.[0]?.variantObj
                      ?.variant_price_details?.[0]?.currency_symbol
                  }
                    ${taxAmount?.toFixed(2)}
                  </td>
                </tr>
    
                <tr style="font-size:14px; text-align:left; padding:10px 0px;">
                  <td style="padding:10px 0"> 
                  
                  </td>
                  <td style="padding:10px 0"> 
                  
                  </td>
                  <td style="padding:10px 0"> 
                  
                  </td>
                  <td style="padding:10px 0; font-weight:700; color:#032140;">
                    Grand Total 
                  </td>
                  <td style="padding:10px 10px 10px 0; font-weight:700; color:#032140; text-align:right">
                  ${
                    variant_quantity?.[0]?.variantObj
                      ?.variant_price_details?.[0]?.currency_symbol
                  } ${grandAmount?.toFixed(2)}
                  </td>
                </tr>
              </tbody>
          </table>
      </div>
    </div>


      </div>
    </div>

    
    </div>
      
  </div>
  `;

  return `<!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
    </head>
    
    <body style="">
       <div style="display: flex;flex-direction:column;">
        
          <div style="display: flex; flex-direction:column; align-items: left;">
            <img src="data:image/webp;base64,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" style="width:160px"/>
            <div style="">
            <p style="margin:0; font-size:14px; text-align:left">www.vuezen.com</P>
            <p style="margin:0; font-size:14px; text-align:left">B-2, Sector-4, Noida,</P>
            <p style="margin:0; font-size:14px; text-align:left">Gautam Buddh Nagar, Uttar Pradesh, India, 201301</P>
            </div>
          </div> 

        <div style="margin-top: 30px;">
          ${ProductHtml}
        </div>

      </div>
    </body>
    
    </html>`;
};
