interface InsightCardProps {
  title: string;
  description: string;
}


export default function InsightCard({

  title,

  description,

}: InsightCardProps) {


  return (

    <div

      className="
        rounded-2xl
        bg-[#007C72]

        p-5

        text-white

        shadow-sm

        sm:p-6
      "

    >


      <h3

        className="
          text-base
          font-semibold

          sm:text-lg
        "

      >

        {title}

      </h3>



      <p

        className="
          mt-3
          text-xs
          leading-relaxed
          text-white/80

          sm:text-sm
        "

      >

        {description}

      </p>


    </div>


  );

}