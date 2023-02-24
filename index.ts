import express, { Request, Response } from "express";
import cors from "cors";
import { z } from "zod";
import { getCoursesFromSemester } from "yamun";
import asyncHandler from "express-async-handler";
import NodeCache from "node-cache";
import debugFactory from "debug";

const debug = debugFactory("yaMUN-api");
const appCache = new NodeCache({ stdTTL: 600 });
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

    const id = `${coursesFromSemesterParams.year}-${coursesFromSemesterParams.term}-${coursesFromSemesterParams.level}`;
    if (appCache.has(id)) {
      debug("Fetching data from cache...");
      res.json(appCache.get(id));
    } else {
      const courses = await getCoursesFromSemester(coursesFromSemesterParams);
      appCache.set(id, courses);
      debug("Fetching data from API...");
      res.json(courses);
    }
  })
);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
