interface CampaignCardProps {

  image?: string;

  title: string;

  status: string;

  period?: string;

}



function getImageUrl(value?: string) {

  if (!value) {

    return "";

  }


  const text = String(value).trim();


  const match = text.match(
    /[-\w]{25,}/
  );


  if (match) {

    return (
      "https://drive.google.com/thumbnail?id="
      + match[0]
      + "&sz=w1600"
    );

  }


  return text;

}





export default function CampaignCard({

  image,

  title,

  status,

  period,

}: CampaignCardProps) {


  const imageUrl = getImageUrl(image);



  return (

    <div

      className="
        overflow-hidden
        rounded-2xl
        border
        border-gray-100
        bg-white
        shadow-sm
      "

    >


      {/* Campaign Image */}

      <div

        className="
          h-[260px]

          sm:h-[320px]

          lg:h-[380px]

          xl:h-[430px]

          bg-gray-100
        "

      >

        {
          imageUrl ? (

            <img

              src={imageUrl}

              alt={title}

              className="
                h-full
                w-full
                object-cover
              "

            />

          ) : (

            <div

              className="
                flex
                h-full
                items-center
                justify-center
                text-sm
                text-gray-400
              "

            >

              Campaign Image

            </div>

          )

        }


      </div>





      {/* Campaign Detail */}

      <div

        className="
          p-4
        "

      >


        <h3

          className="
            line-clamp-2
            text-sm
            font-semibold
            leading-snug
            text-[#14242B]

            lg:text-base
          "

        >

          {title}

        </h3>





        <span

          className="
            mt-3
            inline-flex
            rounded-full
            bg-[#E6F7F5]
            px-3
            py-1
            text-xs
            font-medium
            text-[#007C72]
          "

        >

          {status}

        </span>





        {
          period && (

            <p

              className="
                mt-3
                text-xs
                text-gray-500

                lg:text-sm
              "

            >

              📅 {period}

            </p>

          )
        }


      </div>


    </div>

  );

}