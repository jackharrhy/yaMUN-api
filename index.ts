import express, { Request, Response } from "express";
import cors from "cors";
import { z } from "zod";
import { getCoursesFromSemester } from "yamun";
import asyncHandler from "express-async-handler";

const app = express();

app.use(cors());

const port = Number(process.env.PORT) || 4000;

const CoursesFromSemesterParams = z.object({
  year: z.number(),
  term: z.number(),
  level: z.number(),
});

app.get(
  "/courses/:year/:term/:level",
  asyncHandler(async (req: Request, res: Response) => {
    const coursesFromSemesterParams = CoursesFromSemesterParams.parse({
      year: Number(req.params.year),
      term: Number(req.params.term),
      level: Number(req.params.level),
    });

    // TODO make this cached somehow so it doesn't get refetched every single time
    // however, ensure that after sometime (maybe every hour or so) it _will_ fetch
    // this fresh
    const courses = await getCoursesFromSemester(coursesFromSemesterParams);

    res.json(courses);
  })
);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
