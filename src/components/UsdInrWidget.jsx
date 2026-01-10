
const UsdInrWidget = () => {
  return (
    <div className="flex flex-col items-center">
      <iframe
        title="USD INR Technical Summary"
        src="https://ssltsw.investing.com?lang=56&forex=160,1646,1,2,3,5,9&commodities=8830,8836,8831,8849,8833,8862,8832&indices=23660,166,172,27,179,53094,170&stocks=345,346,347,348,349,350,352&tabs=1,2,3,4"
        className="w-[317px] h-[267px] border-0 rounded-lg shadow-md"
        loading="lazy"
      />

     
    </div>
  );
};

export default UsdInrWidget;
