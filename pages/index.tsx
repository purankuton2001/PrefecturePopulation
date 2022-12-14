import {GetStaticProps} from "next";
import axios from "axios";
import {ChangeEventHandler, useEffect, useRef, useState} from "react";
import Highcharts, {SeriesOptionsType, SeriesXrangeOptions, XrangePointOptionsObject} from "highcharts";
import HighchartsReact from "highcharts-react-official";

type HomeProps = {
  data: {
    message: string | null,
    result: {prefCode: number, prefName: string}[]
  };
  notFound?: boolean;
}

export default function Home({data, notFound}: HomeProps) {
  useEffect(() => {
    if(notFound){
      alert("APIからのデータ取得に失敗しました")
    }
  }, []);
  const [test, setTest] = useState(0);
  const [options, setOptions] = useState<Highcharts.Options>({
    title: {
      text: '都道府県別総人口'
    },
    plotOptions: {
      series: {
        label: {
          connectorAllowed: false,
        },
        pointInterval: 5,
        pointStart: 1965
      }
    },
    series: [],
  });

  const onChangePrefecture: ChangeEventHandler<HTMLInputElement> = async (ev) => {
    const targetValue = ev.target.value.split(",");
    if(ev.target.checked){
      const newSeries: SeriesOptionsType[] = options.series as SeriesOptionsType[];
      const res = await axios.get(
          `https://opendata.resas-portal.go.jp/api/v1/population/composition/perYear`, {
            params: {prefCode: targetValue[0], cityCode: "-"},
            headers: {'X-API-KEY': 'P4SjAyQ6DjjKZxGxZqcyFwBDdml5uQMyR31twL8M'}
          });
      const newData: XrangePointOptionsObject[] = [];
      res.data.result.data[0].data.forEach((targetData: any) => {
        newData.push(targetData.value)
      });
      newSeries.push(
          {name: targetValue[1],
            data: newData,
          } as SeriesOptionsType
      );
    setOptions({... options, series: newSeries})
    }
    else{
      setOptions({...options, series: options.series?.filter(value => value.name !== targetValue[1])});
    }
  }
  console.log(options)

  return (
    <div className={"container"}>
      <h2　className={"title"}>都道府県別総人口グラフ</h2>
      <div className={"checkbox"}>
        {data.result.map((prefecture, index) => {
          return(
              <div className={"checkboxItem"} key={index}>
                <input type="checkbox" value={prefecture.prefCode + "," + prefecture.prefName} onChange={onChangePrefecture}/>
                <div className={"checkboxText"}>{prefecture.prefName}</div>
              </div>
          )
        })}
      </div>
      {/*<div>{options.series?.length}</div>*/}
      <div className={"chart"}>
        <HighchartsReact
            allowChartUpdate={true}
            highcharts={Highcharts}
            options={options}
        />
      </div>
    </div>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const res = await axios.get(
      `https://opendata.resas-portal.go.jp/api/v1/prefectures`, {
        headers: {'X-API-KEY': 'P4SjAyQ6DjjKZxGxZqcyFwBDdml5uQMyR31twL8M'}
      });
  const data = res.data;

  if (!data) {
    return {
      props: {data: {}, notFound: true}
    };
  }

  return {
    props: {data},
  };
};

