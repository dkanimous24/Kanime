import { useState } from "react";

const Genres = ({ genres, selected, onSelected }) => {
  // const [selected, setSelected] = useState("all");
  const [name, setName] = useState("all");

  return (
    <div className="gap-2 justify-self-start hidden md:hidden lg:flex">
      {genres.map((name) => (
        <>
          <div
            key={name}
            onClick={() => {
              onSelected(name);
              setName(name);
            }}
            className={`genre ${selected !== name ? "bg-secondary border-text-muted" : "bg-pop-alt text-primary border-pop-alt"}`}
          >
            <p
              className={`text-[16px] ${selected !== name ? " text-text-secondary" : " text-primary"}`}
            >
              {name}
            </p>
          </div>
        </>
      ))}
    </div>
  );
};

export default Genres;
{
  /* <div onClick={ClickedGenre} className="genre">
  <p>shonen</p>
</div>
<div className="genre">
  <p>shojou</p>
</div>
<div className="genre">
  <p>slice of life</p>
</div>
<div className="genre">
  <p>adventure</p>
</div>
<div className="genre">
  <p>romance</p>
</div>
<div className="genre">
  <p>comedy</p>
</div>
<div className="genre">
  <p>fantasy</p>
</div>
<div className="genre">
  <p>isekai</p>
</div>
<div className="genre">
  <p>slice of life</p>
</div> */
}
