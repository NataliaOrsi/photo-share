import React, { useState, useEffect } from "react";
import { MdDownloadForOffline } from "react-icons/md";
import { AiTwotoneDelete } from "react-icons/ai";
import { Link, useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

import { client, urlFor } from "../client";
import MasonryLayout from "./MasonryLayout";
import { pinDetailMorePinQuery, pinDetailQuery } from "../utils/data";
import Spinner from "./Spinner";

const PinDetail = ({ user }) => {
  const [pins, setPins] = useState(null);
  const [pinDetail, setPinDetail] = useState(null);
  const [comment, setComment] = useState("");
  const [addingComment, setAddingComment] = useState(false);
  const { pinId } = useParams();

  const fetchPinDetails = () => {
    let query = pinDetailQuery(pinId);

    if (query) {
      client.fetch(query).then((data) => {
        setPinDetail(data[0]);

        if (data[0]) {
          query = pinDetailMorePinQuery(data[0]);

          client.fetch(query).then((res) => setPins(res));
        }
      });
    }
  };

  useEffect(() => {
    fetchPinDetails();
  }, [pinId]);

  const addComment = () => {
    if (comment) {
      setAddingComment(true);

      client
        .patch(pinId)
        .setIfMissing({ comments: [] })
        .insert("after", "comments[-1]", [
          {
            comment,
            _key: uuidv4(),
            postedBy: {
              _type: "postedBy",
              _ref: user._id,
            },
          },
        ])
        .commit()
        .then(() => {
          fetchPinDetails();
          setComment("");
          setAddingComment(false);
        });
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      addComment();
    }
  };

  const deleteComment = (key) => {
    client
      .patch(pinId)
      .unset([`comments[_key == "${key}"]`])
      .commit()
      .then(() => {
        window.location.reload();
      });
  };

  if (!pinDetail) return <Spinner message="Loading pin..." />;

  return (
    <>
      <div
        className="flex xl-flex-row flex-col m-auto bg-white"
        style={{ maxWidth: "1500px", borderRadius: "32px" }}
      >
        <div className="flex justify-center items-center md:items-start flex-initial">
          <img
            src={pinDetail?.image && urlFor(pinDetail.image).url()}
            className="rounded-t-3xl rounded-b-lg"
            alt="user-post"
          />
        </div>
        <div className="w-full p-5 flex-1 xl:min-w-620">
          <div className="flex-items-center justify-between">
            <div className="flex gap-2 items-center">
              <a
                href={`${pinDetail?.image.asset.url}?dl=`}
                download
                onClick={(e) => e.stopPropagation()}
                className="bg-white w-9 h-9 rounded-full flex items-center justify-center text-dark text-xl opacity-75 hover:opacity-100 hover:shadow-md outline-none"
              >
                <MdDownloadForOffline />
              </a>
              <a href={pinDetail?.destination} target="_blank" rel="noreferrer">
                {pinDetail?.destination}
              </a>
            </div>
            <div>
              <h1 className="text-4xl font-bold break-words mt-3">
                {pinDetail?.title}
              </h1>
              <p className="mt-3">{pinDetail?.about}</p>
            </div>
            <Link
              to={`user-profile/${pinDetail?.postedBy?._id}`}
              className="flex gap-2 mt-2 items-center"
            >
              <img
                className="w-8 h-8 rounded-full object-cover"
                src={pinDetail?.postedBy?.image}
                alt="user-profile"
                referrerPolicy="no-referrer"
              />
              <p className="font-semibold capitalize">
                {pinDetail?.postedBy?.userName}
              </p>
            </Link>
            <div className="pt-5 pb-5">
              <h2 className="mt-5 text-2xl font-bold">Comments</h2>
              <div className="max-h-370 overflow-y-auto">
                {pinDetail?.comments?.map((comment) => (
                  <div className="flex gap-2 mt-5 items-center bg-white rounded-lg">
                    <img
                      src={comment.postedBy.image}
                      alt="user-profile"
                      className="w-10 h-10 rounded-full cursor-pointer"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex flex-col">
                      <p className="font-bold">{comment.postedBy.userName}</p>
                      <div className="min-w-full border-gray-100 outline-none border-2 py-1 px-2 rounded-2xl">
                        <p>{comment.comment}</p>
                      </div>
                    </div>
                    {comment.postedBy?._id === user?._id && (
                      <button
                        type="button"
                        className="bg-violet-400 text-white rounded-full px-2 py-2 font-semibold text-base outline-none"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteComment(comment._key);
                        }}
                      >
                        <AiTwotoneDelete />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap mt-6 gap-3">
              <Link to={`user-profile/${pinDetail.postedBy?._id}`}>
                <img
                  className="w-10 h-10 rounded-full object-cover cursor-pointer"
                  src={pinDetail.postedBy?.image}
                  alt="user-profile"
                  referrerPolicy="no-referrer"
                />
              </Link>
              <input
                className="flex-1 border-gray-100 outline-none border-2 p-1 rounded-2xl focus:border-gray-300"
                type="text"
                placeholder="Add a comment here"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                type="button"
                className="bg-violet-400 text-white rounded-full px-6 py-2 font-semibold text-base outline-none"
                onClick={addComment}
              >
                {addingComment ? "Posting the comment" : "Post"}
              </button>
            </div>
          </div>
        </div>
      </div>
      {pins?.length > 0 ? (
        <>
          <h2 className="text-center font-bold text-2xl mt-8 mb-4">
            More like this
          </h2>
          <MasonryLayout pins={pins} />
        </>
      ) : (
        <Spinner message="Loading more pins..." />
      )}
    </>
  );
};

export default PinDetail;
