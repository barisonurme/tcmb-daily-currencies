import React, { useEffect, useRef, useState } from "react";
import LoadingSpinner from "./ui/LoadingSpinner";

const TCMB = () => {
  // Formkit Animasyonları
  const parent = useRef(null);

  const [loading, setLoading] = useState(true);
  // const [error, setError] = useState("");
  const SERVER_URL = "https://www.tcmb.gov.tr/kurlar/today.xml";
  const [xmlContent, setXmlContent] = useState([]);
  const [xmlParsedData, setXmlParsedData] = useState([]);
  const [unfilteredContent, setUnfilteredContent] = useState([]);
  const [currencyCodes, setCurrencyCodes] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // CORS için çözüm bulunamadı. Chrome extension "Allow CORS: Access-Control-Allow-Origin" kullanıldı.
      await fetch(SERVER_URL)
        .then(function (response) {
          return response.text();
        })
        .then(function (data) {
          // XML Parser ile fetchlenen data düzeltme işlemi.
          var XMLParser = require("react-xml-parser");
          var xml = new XMLParser().parseFromString(data);
          setXmlParsedData([]);
          setCurrencyCodes([]);
          setXmlContent(xml);

          // Parse işlemi uygulanan datanın state'e aktarımı.
          xml.children.forEach((element) => {
            // XDR kodu ile gelen "ÖZEL ÇEKME HAKKI (SDR)" filtrelemesi.
            if (element.attributes.CurrencyCode === "XDR") return;

            // Fetchlenen datanın map'te kullanabilmesi için xmlParsedData[] düzenlemesi.
            setXmlParsedData((xmlParsedData) => [
              ...xmlParsedData,
              {
                currencyCode: element.attributes.CurrencyCode,
                unit: element.children[0].value,
                turkishName: element.children[1].value,
                forexBuy: element.children[3].value,
                forexSell: element.children[4].value,
              },
            ]);

            // ToDo: Kod tekrarını önlemek için tekrar gözden geçirilmeli.
            setUnfilteredContent((unfilteredContent) => [
              ...unfilteredContent,

              {
                currencyCode: element.attributes.CurrencyCode,
                unit: element.children[0].value,
                turkishName: element.children[1].value,
                forexBuy: element.children[3].value,
                forexSell: element.children[4].value,
              },
            ]);

            // Filtreleme Seçenekleri için currencyCodes[].
            setCurrencyCodes((currencyCodes) => [
              ...currencyCodes,
              element.attributes.CurrencyCode,
            ]);
          });
        });
    } catch (err) {
      alert(err); // Başarısız Fetch
    }
    setLoading(false);
  };

  useEffect(() => {
    // Component ilk render olduğunda fetch işleminin başlaması.
    fetchData();
  }, []);

  // Filtreleme işlemleri
  const filterHandler = (e) => {
    const selectedFilter = e.target.value;
    if (selectedFilter === "Tümü") {
      setXmlParsedData(unfilteredContent);
      return;
    }
    setXmlParsedData(
      unfilteredContent.filter(
        (filteredCurrency) => filteredCurrency.currencyCode === selectedFilter
      )
    );
  };
  const currencyFilter = (
    <select onChange={filterHandler} name="cars" id="cars">
      <option value="Tümü">Tümü</option>
      {currencyCodes.map((code) => (
        <option key={code} value={code}>
          {code}
        </option>
      ))}
    </select>
  );

  // Sıralama İşlemleri
  const sortingHandler = (e) => {
    const selectedSorting = e.target.value;
    const unfilteredContentCopy = [...unfilteredContent];
    switch (selectedSorting) {
      case "Varsayılan":
        break;
      case "Artan":
        unfilteredContentCopy.sort((a, b) => {
          return a.forexBuy - b.forexBuy;
        });
        break;
      case "Azalan":
        unfilteredContentCopy.sort((b, a) => {
          return a.forexBuy - b.forexBuy;
        });
        break;
      default:
        break;
    }
    setXmlParsedData(unfilteredContentCopy);
  };

  const currencySort = (
    <select
      onChange={sortingHandler}
      name="cars"
      className="text-center"
      id="cars"
    >
      <option value="Varsayılan">Varsayılan</option>
      <option value="Artan">Artan</option>
      <option value="Azalan">Azalan</option>
    </select>
  );

  // Filtreleme divi
  const filters = (
    <div className="flex justify-between pl-12 pr-12 border rounded-xl p-4 mt-6">
      <div>Sırala: {currencySort}</div>
      <div>Filtrele: {currencyFilter}</div>
    </div>
  );

  return (
    <>
      {/* Sayfada herhangi bir yükleme olup olmadığının kontrolü */}
      {loading ? (
        <LoadingSpinner styles={"border-4 h-12 w-12"} />
      ) : (
        <div className="flex flex-col max-w-[720px] w-full p-4">
          {filters}
          <div ref={parent} className="flex flex-col w-full">
            {xmlParsedData.map((currency) => (
              <ul
                key={currency.currencyCode}
                className="group border p-2 mt-2 mb-2 rounded-2xl bg-gray-200 border-gray-400  hover:shadow-inner duration-500"
              >
                <div className="flex justify-between items-center text-xl font-extrabold m-2 text-gray-500 group-hover:text-gray-600 tracking-wider">
                  <div className="flex">
                    <div className="rounded-full bg-gray-300 overflow-hidden border border-gray-500 shadow-inner">
                      {/* ToDo: ÖZEL ÇEKME HAKKI (SDR) Görseli için çözüm bulunmalı */}
                      <img
                        alt="cuntryFlag"
                        className="relative m-2"
                        src={`https://www.tcmb.gov.tr/kurlar/kurlar_tr_dosyalar/images/${currency.currencyCode}.gif`}
                      />
                    </div>
                    <div className="ml-2">
                      {currency.unit > 1 && (
                        <span>{currency.unit} BİRİM&nbsp;</span>
                      )}
                      {currency.turkishName}
                    </div>
                  </div>
                </div>
                <div
                  className="border w-full justify-between rounded-xl bg-gray-50 shadow-sm flex items-center p-4 group-hover:border-gray-900 duration-500 group-hover:shadow-lg"
                  key={currency.currencyCode}
                >
                  <div className="flex flex-col">
                    <div className=" text-gray-400 group-hover:text-gray-600 text-left font-bold  text-xs">
                      Cinsi
                    </div>
                    <div className=" text-gray-500 group-hover:text-gray-600 font-bold">
                      {currency.currencyCode}
                    </div>
                  </div>
                  <div className="flex flex-col justify-start">
                    <div className="flex text-gray-400 group-hover:text-gray-600 text-left font-bold  text-xs">
                      Alış
                    </div>
                    <div className="flex w-16 text-gray-500 group-hover:text-gray-600 font-bold">
                      {(currency.forexBuy * 1).toFixed(2)}
                    </div>
                  </div>
                  <div className="flex flex-col justify-start">
                    <div className="flex text-gray-400 group-hover:text-gray-600 text-left font-bold  text-xs">
                      Satış
                    </div>
                    <div className="flex w-16 text-gray-500 group-hover:text-gray-600 font-bold">
                      {(currency.forexBuy * 1).toFixed(2)}
                    </div>
                  </div>
                </div>
              </ul>
            ))}
          </div>
          <div className="w-full flex flex-col justify-center items-center text-2xl p-8">
            <div className="text-xs">
              {xmlContent.attributes.Date} Günü Saat 15:30'da Belirlenen
              Gösterge Niteliğindeki Türkiye Cumhuriyet Merkez Bankası Kurları
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TCMB;
