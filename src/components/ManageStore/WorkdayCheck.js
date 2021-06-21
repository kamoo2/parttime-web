import React, { useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useLazyQuery, useMutation } from "@apollo/client";
import { CREATE_WORKDAY_MUTATION } from "../../apollo/mutation/workday";
import { SEE_EMPLOYEES_QUERY } from "../../apollo/queries/employee";
import { SEE_WORKDAYS_QUERY } from "../../apollo/queries/workday";
import styled from "styled-components";
import { useForm } from "react-hook-form";
import FormError from "../auth/FormError";
import { useState } from "react/cjs/react.development";

const Wrapper = styled.div`
  padding: 20px 30px;
`;
const Description = styled.div`
  width: 50%;
  margin: 0 auto;
  form {
    margin: 10px 0;
    display: flex;
    align-items: center;
    input {
      width: 60px;
      font-size: 20px;
      border-bottom: 1px solid black;
      text-align: center;
    }
    button {
      background-color: ${(props) => props.theme.login.btnBgColor};
      color: ${(props) => props.theme.login.btnFontColor};
      padding: 8px 12px;
      border-radius: 7px;
      margin-left: 10px;
      cursor: pointer;
    }
  }
`;
const Name = styled.span`
  font-size: 30px;
  border-radius: 10px;
  padding: 5px 7px;
  background-color: ${(props) => props.theme.login.btnBgColor};
  color: ${(props) => props.theme.login.btnFontColor};
`;
const WorkCount = styled.h1`
  font-size: 20px;
  margin-bottom: 8px;
`;
const Span = styled.h1`
  font-size: 20px;
`;

const Time = styled.span`
  padding: 10px 15px;
  border-radius: 50%;
  background-color: ${(props) => props.theme.login.btnBgColor};
  color: ${(props) => props.theme.login.btnFontColor};
  position: absolute;
  top: 50px;
  right: 50px;
`;

const WorkdayCheck = ({ storeId, employeeId, salary, name }) => {
  const [wTime, setWTime] = useState(0);
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = now.getMonth() + 1;
  const dd = now.getDate() + 1;
  const slug = mm < 10 ? `${yyyy}-0${mm}-${dd}` : `${yyyy}-${mm}-${dd}`;
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({ mode: "onChange" });
  const [createWorkdayMutation, { loading, data }] = useMutation(
    CREATE_WORKDAY_MUTATION,
    {
      refetchQueries: [
        { query: SEE_EMPLOYEES_QUERY, variables: { storeId } },
        {
          query: SEE_WORKDAYS_QUERY,
          variables: {
            employeeId,
          },
        },
      ],
      onCompleted: (data) => {
        if (!data?.createWorkday?.ok) {
          setError("result", { message: data?.createWorkday?.error });
        }
      },
    }
  );
  const [getWorkdays, { data: getWorkdaysData, loading: getWorkdaysLoading }] =
    useLazyQuery(SEE_WORKDAYS_QUERY, {
      variables: {
        employeeId,
      },
    });

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      getWorkdays();
    }
    return () => {
      isMounted = false;
    };
  }, [getWorkdays]);

  const handleDateClick = (arg) => {
    if (loading) {
      return;
    }
    if (getWorkdaysLoading) {
      return;
    }
    const { date } = arg;
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    createWorkdayMutation({
      variables: {
        year,
        month,
        day,
        workTime: parseInt(wTime),
        employeeId,
      },
    });
  };

  let eventObjs = [];
  eventObjs = getWorkdaysData?.seeWorkdays.map((workday) => {
    return {
      title: `${workday.workTime.time}시간 출근완료`,
      start:
        workday.month < 10
          ? workday.day < 10
            ? `${workday.year}-0${workday.month}-0${workday.day}`
            : `${workday.year}-0${workday.month}-${workday.day}`
          : `${workday.year}-${workday.month}-0${workday.day}`,
    };
  });

  const onSubmitValid = (data) => {
    console.log(data);
    setWTime(data.workTime);
  };
  const wt = register("workTime", {
    required: "근무 시간을 입력해주세요.",
    pattern: {
      value: /^([1-9]|1[012])$/g,
      message: "1에서 12까지의 숫자만 입력해주세요.",
    },
  });
  return (
    <Wrapper>
      <Name>{name}님</Name>
      <Description>
        <WorkCount>
          6월 출근 일수는 {getWorkdaysData?.seeWorkdays.length}일 입니다.
        </WorkCount>
        <Span>
          6월 실시간 월급은 {parseInt(salary).toLocaleString()} 원입니다.
        </Span>
        <form onSubmit={handleSubmit(onSubmitValid)}>
          <Span>TIME : </Span>
          <input
            {...wt}
            maxLength="2"
            type="text"
            onChange={(e) => {
              clearErrors("result");
              wt.onChange(e);
            }}
          />
          <Span>시간</Span>
          <button type="submit">근무 시간 등록</button>
        </form>
        <FormError message={errors?.workTime?.message} />
        <FormError message={errors?.result?.message} />
        <Time>{wTime}시간</Time>
      </Description>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        dateClick={handleDateClick}
        validRange={{ end: slug }}
        events={eventObjs}
      />
    </Wrapper>
  );
};

export default WorkdayCheck;